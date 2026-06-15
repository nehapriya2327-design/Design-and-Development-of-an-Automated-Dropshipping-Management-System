import prisma from "@/lib/prisma";

import { fetchShopifyGraphQL } from "@/lib/server/shopify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Id not provided" },
        { status: 400 }
      );
    }

    // Fetch the Shopify order GID using the formatted ID stored in DB
    const order = await prisma.ebayOrder.findUnique({
      where: { formattedShopifyOrderId: id },
      select: { shopifyOrderId: true },
    });

    if (!order?.shopifyOrderId) {
      return NextResponse.json(
        { success: false, message: "Shopify order ID not found" },
        { status: 404 }
      );
    }

    const cancelMutation = `
      mutation {
        orderCancel(
          orderId: "${order.shopifyOrderId}",
          notifyCustomer: false,
          refund: false,
          restock: false,
          reason: INVENTORY,
          staffNote: "Cancelled via eBay sync"
        ) {
          job {
            id
            done
          }
          orderCancelUserErrors {
            field
            message
            code
          }
          userErrors {
            field
            message
          }
        }
      }
`;

    // Add variable support to fetchShopifyGraphQL
    const cancelResponse = await fetchShopifyGraphQL<{
      orderCancel: {
        job: {
          id: string;
          done: boolean;
        };
        orderCancelUserErrors: Array<{
          field: string[];
          message: string;
          code: string;
        }>;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(cancelMutation);
    // console.log(cancelResponse, "cancell");

    const { job, orderCancelUserErrors, userErrors } =
      cancelResponse.orderCancel;
    if (userErrors.length > 0 || orderCancelUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          userErrors,
          orderCancelUserErrors,
        },
        { status: 400 }
      );
    }
    await prisma.cancelledOrder.update({
      where: { storeOrderId: id },
      data: {
        isCancelledShopify: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order canceled successfully",
      job,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
