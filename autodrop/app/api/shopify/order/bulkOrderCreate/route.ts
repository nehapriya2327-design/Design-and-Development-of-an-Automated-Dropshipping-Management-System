import prisma from "@/lib/prisma";
import { getEbayOrderByEbayOrderId } from "@/lib/server/ebay";
import { fetchShopifyGraphQL } from "@/lib/server/shopify";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { ids } = body;

    const result = await Promise.allSettled(
      ids.map(async (id: string) => {
        try {
          const ebayOrder = await getEbayOrderByEbayOrderId(id);

          if (ebayOrder?.shopifyOrderId && ebayOrder?.shopifyDraftOrderId) {
            return {
              message: "Order already created and completed in Shopify.",
              shopifyOrderId: ebayOrder.shopifyOrderId,
              shopifyDraftOrderId: ebayOrder.shopifyDraftOrderId,
            };
          }

          const lineItem = ebayOrder?.orderItem[0];
          const shippingAddress = ebayOrder?.shippingAddress;

          const variant = await prisma.variant.findUnique({
            where: { sku: lineItem?.sku },
          });

          if (!variant)
            throw new Error(`Variant not found for SKU: ${lineItem?.sku}`);

          const mutation = `
            mutation {
              draftOrderCreate(input: {
                lineItems: [{
                  quantity: ${lineItem?.quantity},
                  variantId: "${variant.shopifyId}",
                  customAttributes: [{ key: "ebay_order_id", value: "${id}" }]
                }],
                shippingAddress: {
                  address1: "${shippingAddress?.addressLine1 ?? ""}",
                  city: "${shippingAddress?.city ?? ""}",
                  provinceCode: "${shippingAddress?.state ?? ""}",
                  countryCode: ${shippingAddress?.country},
                  zip: "${shippingAddress?.zipCode ?? ""}",
                  firstName: "${ebayOrder?.buyerName?.split(" ")[0] ?? ""}",
                  lastName: "${
                    ebayOrder?.buyerName?.split(" ")?.slice(1)?.join(" ") ?? ""
                  }",
                  phone: "${ebayOrder?.buyerPhoneNo ?? ""}"
                },
                email: "${ebayOrder?.buyerEmail ?? ""}",
                useCustomerDefaultAddress: false,
                tags: ["eBay", "Zendrop"]
              }) {
                draftOrder { id }
                userErrors { field message }
              }
            }`;

          const draftOrder = (await fetchShopifyGraphQL(mutation)) as {
            draftOrderCreate?: {
              draftOrder?: { id?: string };
              userErrors?: { field?: string; message?: string }[];
            };
          };
          const draftOrderId = draftOrder.draftOrderCreate?.draftOrder?.id;

          if (!draftOrderId) {
            return {
              id,
              error:
                draftOrder.draftOrderCreate?.userErrors ||
                "Failed to create draft order",
            };
          }

          const draftShopifyOrder = await prisma.ebayOrder.update({
            where: { ebayOrderid: id },
            data: { shopifyDraftOrderId: draftOrderId },
          });

          console.log(draftShopifyOrder, "draft");

          const completeMutation = `
            mutation {
              draftOrderComplete(id: "${draftOrderId}", paymentPending: false) {
                draftOrder {
                  id
                  order { id }
                }
                userErrors { field message }
              }
            }`;

          const completeOrder = (await fetchShopifyGraphQL(
            completeMutation
          )) as {
            draftOrderComplete?: {
              draftOrder?: {
                id?: string;
                order?: { id?: string };
              };
              userErrors?: { field?: string; message?: string }[];
            };
          };
          const orderId =
            completeOrder.draftOrderComplete?.draftOrder?.order?.id;

          if (!orderId) {
            return {
              id,
              error:
                completeOrder?.draftOrderComplete?.userErrors ||
                "Failed to complete draft order",
            };
          }

         await prisma.ebayOrder.update({
            where: { ebayOrderid: id },
            data: {
              shopifyOrderId: orderId,
              formattedShopifyOrderId: orderId.split("/").pop(),
            },
          });
          // console.log(ordershopify, "shopifybulk");

          return {
            message: "Order created and marked as paid in Shopify.",
            draftOrderId,
            shopifyOrderId: orderId,
            completeResponse: completeOrder?.draftOrderComplete,
          };
        } catch (error) {
          return {
            id,
            error:
              error instanceof Error
                ? error.message
                : "Unknown error during order creation",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    const status: number =
      (error as { response?: { status?: number } }).response?.status ?? 500;
    const details: unknown =
      (error as { response?: { data?: unknown }; message?: string }).response
        ?.data ??
      (error as { message?: string }).message ??
      "Unknown error";

    return NextResponse.json(
      {
        error: true,
        status,
        details,
      },
      { status }
    );
  }
};
