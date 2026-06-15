import { fetchShopifyGraphQL } from "@/lib/server/shopify";
import { NextResponse } from "next/server";

interface ShopifyOrder {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  closedAt: string | null;
  currentTotalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        originalUnitPriceSet: {
          shopMoney: {
            amount: string;
            currencyCode: string;
          };
        };
      };
    }[];
  };
  fulfillments: {
    trackingInfo: {
      number: string;
      url: string;
    }[];
    status: string;
  }[];
}

export async function GET() {
  const query = `
    {
  orders(first: 50, reverse: true) {
    edges {
      node {
        id
        name
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        cancelledAt
        cancelReason
        closedAt
        currentTotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          edges {
            node {
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        fulfillments(first: 1) {
          trackingInfo {
            number
            url
          }
          status
        }
      }
    }
  }
}
  `;

  try {
    const response = await fetchShopifyGraphQL<{
      orders: {
        edges: { node: ShopifyOrder }[];
      };
    }>(query);

    const orders = response.orders.edges.map((edge) => edge.node);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
