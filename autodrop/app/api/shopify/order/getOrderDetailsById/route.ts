import prisma from "@/lib/prisma";
import { fetchShopifyGraphQL } from "@/lib/server/shopify";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id"); // this should be Shopify GraphQL ID

  const order = await prisma.ebayOrder.findUnique({
    where: { ebayOrderid: String(orderId) },
  });

  if (!orderId) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  const query = `
  {
    order(id: "${order?.shopifyOrderId}") {
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
`;

  try {
    const response = await fetchShopifyGraphQL<{
      order: {
        cancelReason: string;
        cancelledAt: string;
      };
    }>(query);

    if (!response.order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.ebayOrder.update({
      where: { ebayOrderid: orderId },
      data: {
        shopifyOrderCancelReason: response?.order?.cancelReason,
        shopifyOrderCancelAt: response.order.cancelledAt,
      },
    });

    return NextResponse.json({ order: response.order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
