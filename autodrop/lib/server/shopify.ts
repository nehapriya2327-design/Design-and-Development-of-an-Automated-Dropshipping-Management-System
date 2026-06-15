import prisma from "@/lib/prisma";
import { DisplayStatus, ShipmentStatus } from "@prisma/client";
import axios from 'axios';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE}/admin/api/2025-04/graphql.json`;

interface ShopifyOption {
  name: string;
  values: string[];
}

interface SelectedOption {
  name: string;
  value: string;
}

interface ShopifyVariant {
  shopifyId: string;
  formattedId: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  imageUrl: string;
  imageAlt: string;
  selectedOptions: SelectedOption[];
}

interface ShopifyImage {
  id: string;
  src: string;
  alt: string;
}

interface ShopifyProduct {
  shopifyId: string;
  formattedId: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
  priceRangeV2?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  descriptionHtml: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  handle: string;
  imageUrl: string;
  images: ShopifyImage[];
  options: ShopifyOption[];
  price: number;
  inventory: number;
  variants: ShopifyVariant[];
}

interface ShopifyLineItem {
  id: string;
  name: string;
  quantity: number;
  sku: string;
}

interface ShopifyFulfillmentLineItem {
  id: string;
  quantity: number;
  lineItem: ShopifyLineItem;
}

interface ShopifyFulfillmentLineItemsConnection {
  edges: { node: ShopifyFulfillmentLineItem }[];
}

interface ShopifyTrackingInfo {
  company: string;
  number: string;
  url: string;
}

interface ShopifyFulfillment {
  id: string;
  status: string;
  displayStatus: string;
  trackingInfo: ShopifyTrackingInfo[];
  estimatedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  fulfillmentLineItems?: ShopifyFulfillmentLineItemsConnection;
}

interface ShopifyOrderNode {
  id: string;
  name: string;
  fulfillments: ShopifyFulfillment[];
}

interface ShopifyOrderEdge {
  node: ShopifyOrderNode;
  cursor: string;
}

interface ShopifyOrdersConnection {
  edges: ShopifyOrderEdge[];
  pageInfo: {
    hasNextPage: boolean;
  };
}

interface ShopifyShipment {
  shopifyShipmentId: string;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: ShipmentStatus;
  displayStatus: DisplayStatus;
  estimatedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  fulfillmentLineItems?: ShopifyFulfillmentLineItemsConnection;
}

interface ShopifyReturnLineItem {
  id: string;
  returnReason: string;
}

interface ShopifyReturnLineItemsConnection {
  edges: { node: ShopifyReturnLineItem }[];
}

interface ShopifyReturnOrder {
  id: string;
  name: string;
  order: {
    id: string;
    name: string;
  };
  returnLineItems: ShopifyReturnLineItemsConnection;
  status: string;
}

interface ShopifyReturnCreateResponse {
  returnCreate: {
    return: ShopifyReturnOrder | null;
    userErrors: { field: string[]; message: string }[];
  };
}



interface ProductDeleteResponse {
  productDelete: {
    deletedProductId: string | null;
    userErrors: Array<{
      message: string;
    }>;
  };
}




// Utility function to send GraphQL queries
export async function fetchShopifyGraphQL<T = unknown>(query: string): Promise<T> {
  const response = await axios.post(
    SHOPIFY_GRAPHQL_URL,
    { query },
    {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.errors) {
    console.error('Shopify GraphQL Errors:', response.data.errors);
    throw new Error('Shopify GraphQL query failed');
  }

  return response.data.data as T;
}

// Fetch multiple products
export async function getShopifyProductsGraphQL(): Promise<ShopifyProduct[]> {
  const query = `
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            createdAt
            updatedAt
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            descriptionHtml
            description
            vendor
            productType
            tags
            handle
            options {
              name
              values
            }
            images(first: 5) {
              edges {
                node {
                  id
                  originalSrc
                  altText
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                  inventoryQuantity
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    originalSrc
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  type ShopifyProductsResponse = {
    products: {
      edges: {
        node: {
          id: string;
          title: string;
          createdAt: string;
          updatedAt: string;
          priceRangeV2: {
            minVariantPrice: {
              amount: string;
              currencyCode: string;
            };
            maxVariantPrice: {
              amount: string;
              currencyCode: string;
            };
          };
          descriptionHtml: string;
          description: string;
          vendor: string;
          productType: string;
          tags: string[];
          handle: string;
          options: ShopifyOption[];
          images: {
            edges: {
              node: {
                id: string;
                originalSrc: string;
                altText: string | null;
              };
            }[];
          };
          variants: {
            edges: {
              node: {
                id: string;
                title: string;
                sku: string;
                price: string;
                compareAtPrice: string | null;
                inventoryQuantity: number;
                selectedOptions: SelectedOption[];
                image: {
                  originalSrc: string;
                  altText: string | null;
                } | null;
              };
            }[];
          };
        };
      }[];
    };
  };

  const data = await fetchShopifyGraphQL<ShopifyProductsResponse>(query);
  const rawProducts = data.products.edges;

  return rawProducts.map(({ node }): ShopifyProduct => {
    const variants = node.variants.edges;

    return {
      shopifyId: node.id,
      formattedId: node.id.split('/').pop()!,
      title: node.title,
      createdAt: new Date(node.createdAt),
      updatedAt: new Date(node.updatedAt),
      priceRangeV2: node.priceRangeV2,
      descriptionHtml: node.descriptionHtml,
      description: node.description,
      vendor: node.vendor,
      productType: node.productType,
      tags: node.tags,
      handle: node.handle,
      options: node.options.map((opt) => ({
        name: opt.name,
        values: opt.values,
      })),
      imageUrl: node.images.edges[0]?.node.originalSrc || '',
      images: node.images.edges.map((img) => ({
        id: img.node.id,
        src: img.node.originalSrc,
        alt: img.node.altText || '',
      })),
      price: parseFloat(variants[0]?.node.price ?? '0'),
      inventory: variants.reduce(
        (acc, v) => acc + v.node.inventoryQuantity,
        0
      ),
      variants: variants.map((v): ShopifyVariant => ({
        shopifyId: v.node.id,
        formattedId: v.node.id.split('/').pop()!,
        title: v.node.title,
        sku: v.node.sku,
        price: parseFloat(v.node.price),
        compareAtPrice: v.node.compareAtPrice
          ? parseFloat(v.node.compareAtPrice)
          : null,
        inventory: v.node.inventoryQuantity,
        imageUrl: v.node.image?.originalSrc || '',
        imageAlt: v.node.image?.altText || '',
        selectedOptions: v.node.selectedOptions.map((o) => ({
          name: o.name,
          value: o.value,
        })),
      })),
    };
  });
}

// Fetch single product by ID
export async function getProductByIdGraphQL(productId: string): Promise<ShopifyProduct> {
  const gid = productId.startsWith('gid://') ? productId : `gid://shopify/Product/${productId}`;

  const query = `
    {
      product(id: "${gid}") {
        id
        title
        descriptionHtml
        description
        vendor
        productType
        tags
        handle
        options {
          name
          values
        }
        images(first: 5) {
          edges {
            node {
              id
              originalSrc
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              sku
              price
              compareAtPrice
              inventoryQuantity
              selectedOptions {
                name
                value
              }
              image {
                originalSrc
                altText
              }
            }
          }
        }
      }
    }
  `;

  type ShopifyProductResponse = {
    product: {
      id: string;
      title: string;
      descriptionHtml: string;
      description: string;
      vendor: string;
      productType: string;
      tags: string[];
      handle: string;
      options: ShopifyOption[];
      images: {
        edges: {
          node: {
            id: string;
            originalSrc: string;
            altText: string | null;
          };
        }[];
      };
      variants: {
        edges: {
          node: {
            id: string;
            title: string;
            sku: string;
            price: string;
            compareAtPrice: string | null;
            inventoryQuantity: number;
            selectedOptions: SelectedOption[];
            image: {
              originalSrc: string;
              altText: string | null;
            } | null;
          };
        }[];
      };
    };
  };

  const data = await fetchShopifyGraphQL<ShopifyProductResponse>(query);
  const product = data.product;
  const variants = product.variants.edges;

  return {
    shopifyId: product.id,
    formattedId: product.id.split('/').pop()!,
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    description: product.description,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    handle: product.handle,
    options: product.options.map((opt) => ({
      name: opt.name,
      values: opt.values,
    })),
    imageUrl: product.images.edges[0]?.node.originalSrc || '',
    images: product.images.edges.map((img) => ({
      id: img.node.id,
      src: img.node.originalSrc,
      alt: img.node.altText || '',
    })),
    price: parseFloat(variants[0]?.node.price ?? '0'),
    inventory: variants.reduce(
      (acc, v) => acc + v.node.inventoryQuantity,
      0
    ),
    variants: variants.map((v): ShopifyVariant => ({
      shopifyId: v.node.id,
      formattedId: v.node.id.split('/').pop()!,
      title: v.node.title,
      sku: v.node.sku,
      price: parseFloat(v.node.price),
      compareAtPrice: v.node.compareAtPrice
        ? parseFloat(v.node.compareAtPrice)
        : null,
      inventory: v.node.inventoryQuantity,
      imageUrl: v.node.image?.originalSrc || '',
      imageAlt: v.node.image?.altText || '',
      selectedOptions: v.node.selectedOptions.map((o) => ({
        name: o.name,
        value: o.value,
      })),
    })),
  };
}

// Fetch multiple shipments for a single order
export async function getShopifyShipmentGraphQL(orderId: string): Promise<ShopifyShipment[]> {
  const query = `{
        order(id: "gid://shopify/Order/${orderId}") {
            fulfillments {
                id
                status
                displayStatus
                trackingInfo {
                    company
                    number
                    url
                }
                estimatedDeliveryAt
                createdAt
                updatedAt
                deliveredAt
                fulfillmentLineItems(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                      lineItem {
                        id
                        name
                        quantity
                        sku
                      }
                    }
                  }
                }
            }
        }
    }
`;

  type ShopifyOrderFulfillmentResponse = {
    order: {
      fulfillments: ShopifyFulfillment[];
    };
  };

  const data = await fetchShopifyGraphQL<ShopifyOrderFulfillmentResponse>(query);
  const rawFulfillments = data?.order?.fulfillments || [];

  const results: ShopifyShipment[] = [];

  if (rawFulfillments?.length) {
    for (const fulfillment of rawFulfillments) {
      const shipmentData: ShopifyShipment = {
        shopifyShipmentId: fulfillment.id,
        orderId: 12346, // You may want to update this logic
        carrier: fulfillment.trackingInfo?.[0]?.company || '',
        trackingNumber: fulfillment.trackingInfo?.[0]?.number || '',
        trackingUrl: fulfillment.trackingInfo?.[0]?.url || '',
        status: fulfillment.status as ShipmentStatus,
        displayStatus: fulfillment.displayStatus as DisplayStatus,
        estimatedDeliveryAt: fulfillment.estimatedDeliveryAt,
        createdAt: fulfillment.createdAt,
        updatedAt: fulfillment.updatedAt,
        deliveredAt: fulfillment.deliveredAt,
        fulfillmentLineItems: fulfillment.fulfillmentLineItems,
      };

      results.push(shipmentData);
    }
  }

  return results;
}

export async function getShopifyShipmentsGraphQL(): Promise<ShopifyShipment[]> {
  const query = `
    {
      orders(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            fulfillments {
              id
              status
              displayStatus
              createdAt
              updatedAt
              estimatedDeliveryAt
              deliveredAt
              trackingInfo {
                number
                company
                url
              }
              fulfillmentLineItems(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    lineItem {
                      id
                      name
                      quantity
                      sku
                    }
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  type ShopifyOrdersResponse = {
    orders: ShopifyOrdersConnection;
  };

  const data = await fetchShopifyGraphQL<ShopifyOrdersResponse>(query);
  const orderNodes = data?.orders?.edges || [];

  const results: ShopifyShipment[] = [];

  if (orderNodes?.length) {
    for (const orderNode of orderNodes) {
      let orderId = 0;

      if (orderNode.node?.fulfillments?.length > 0) {
        const order = await prisma.ebayOrder.findFirst({ where: { shopifyOrderId: orderNode.node.id } });
        if (order && order?.id) {
          orderId = order.id;
        }
      }

      if (orderId === 0) {
        continue;
      }

      const rawFulfillments = orderNode.node?.fulfillments || [];

      for (const fulfillment of rawFulfillments) {
        const shipmentData: ShopifyShipment = {
          shopifyShipmentId: fulfillment.id,
          orderId: orderId,
          carrier: fulfillment.trackingInfo?.[0]?.company || '',
          trackingNumber: fulfillment.trackingInfo?.[0]?.number || '',
          trackingUrl: fulfillment.trackingInfo?.[0]?.url || '',
          status: fulfillment.status as ShipmentStatus,
          displayStatus: fulfillment.displayStatus as DisplayStatus,
          estimatedDeliveryAt: fulfillment.estimatedDeliveryAt,
          createdAt: fulfillment.createdAt,
          updatedAt: fulfillment.updatedAt,
          deliveredAt: fulfillment.deliveredAt,
          fulfillmentLineItems: fulfillment.fulfillmentLineItems,
        };

        results.push(shipmentData);
      }
    }
  }

  return results;
}

export async function createShopifyReturnGraphQL(): Promise<ShopifyReturnOrder[]> {
  const shopifyOrderId = "gid://shopify/Order/6017431470259";
  const fulfillmentLineItemId = "gid://shopify/FulfillmentLineItem/12549539758259";
  const quantity = 1;
  const returnReason = "DEFECTIVE";
  const reasonNote = "Item Defective";

  const query = `
    mutation {
      returnCreate(returnInput: {
        orderId: "${shopifyOrderId}",
        returnLineItems: [
          {
            fulfillmentLineItemId: "${fulfillmentLineItemId}",
            quantity: ${quantity},
            returnReason: ${returnReason},
            returnReasonNote: "${reasonNote}"
          }
        ],
        notifyCustomer: false
      }) {
        return {
          id
          name
          order {
            id
            name
          }
          returnLineItems(first: 10) {
            edges {
              node {
                id
                returnReason
              }
            }
          }
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const returnData: ShopifyReturnOrder[] = [];

    const res = await fetchShopifyGraphQL<ShopifyReturnCreateResponse>(query);

    const returnOrder = res?.returnCreate?.return;
    if (returnOrder?.id) {
      const data = {
        shopifyReturnId: returnOrder.id,
        ebayId: 123,
        orderId: 12345,
        shopifyOrderId: shopifyOrderId,
        fulfillmentLineItem: fulfillmentLineItemId,
        quantity: quantity,
        returnReason: returnReason,
        returnLineItems: returnOrder.returnLineItems ? JSON.parse(JSON.stringify(returnOrder.returnLineItems)) : null,
        status: returnOrder.status,
      };

      const shopifyReturn = await prisma.shopifyReturn.create({ data });
      returnData.push({
        id: String(shopifyReturn.id),
        name: returnOrder.name,
        order: returnOrder.order,
        returnLineItems: returnOrder.returnLineItems,
        status: returnOrder.status,
      });
    }

    return returnData;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof (error as { response: unknown }).response === "object"
    ) {
      // @ts-expect-error: response may not have data/message
      console.error("shopify API error:", error.response?.data || error.response?.message);
    } else {
      console.error("shopify API error:", error);
    }
    return [];
  }
}



export async function processShopifyReturnGraphQL(): Promise<ShopifyReturnOrder[]> {
  const shopifyOrderId = "gid://shopify/Order/6017431470259";
  const fulfillmentLineItemId = "gid://shopify/FulfillmentLineItem/12549539758259";
  const quantity = 1;
  const returnReason = "DEFECTIVE";

  const shopifyReturnId = "gid://shopify/Order/6017431470259";

  const query = `
    mutation {
      returnProcess(input: {
        returnId: "${shopifyReturnId}",
        notifyCustomer: true
      }) {
        return {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const returnData: ShopifyReturnOrder[] = [];

    const res = await fetchShopifyGraphQL<ShopifyReturnCreateResponse>(query);

    const returnOrder = res?.returnCreate?.return;
    if (returnOrder?.id) {
      const data = {
        shopifyReturnId: returnOrder.id,
        ebayId: 123,
        orderId: 12345,
        shopifyOrderId: shopifyOrderId,
        fulfillmentLineItem: fulfillmentLineItemId,
        quantity: quantity,
        returnReason: returnReason,
        returnLineItems: returnOrder.returnLineItems ? JSON.parse(JSON.stringify(returnOrder.returnLineItems)) : null,
        status: returnOrder.status,
      };

      const shopifyReturn = await prisma.shopifyReturn.create({ data });
      returnData.push({
        id: String(shopifyReturn.id),
        name: returnOrder.name,
        order: returnOrder.order,
        returnLineItems: returnOrder.returnLineItems,
        status: returnOrder.status,
      });
    }

    return returnData;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof (error as { response: unknown }).response === "object"
    ) {
      // @ts-expect-error: response may not have data/message
      console.error("shopify API error:", error.response?.data || error.response?.message);
    } else {
      console.error("shopify API error:", error);
    }
    return [];
  }
}







export async function deleteShopifyProduct(productId:string): Promise<ProductDeleteResponse|null> {

 

  const query = `
    mutation {
      productDelete(input: {id: "gid://shopify/Product/${productId}"}) {
        deletedProductId
        userErrors {
          message
        }
      }
    }
  `;

  try {
   
    const res = await fetchShopifyGraphQL<ProductDeleteResponse>(query);
    return res;

  } catch (error: unknown) {
  
      console.error("shopify API error:", error);
      return null;
  }
}





