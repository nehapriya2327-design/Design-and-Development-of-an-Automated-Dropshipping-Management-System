// import prisma from "@/lib/prisma";
import prisma from "@/lib/prisma";
import { zendropToken } from "@/lib/server/zendropToken";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type Order = {
  store_order_id: string;
  is_cancelled_attribute: boolean;
  is_cancelled_status_attribute: boolean;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Extract query parameters from request
  const page = searchParams.get("page") || "1";
  const colmname = "id";
  const orderby = "asc";
  const fulfillmentStatus = "all"; // e.g., 'fulfilled', 'unfulfilled'

  const ZENDROP_API_URL = `https://app.zendrop.com/api/stores/2551142/orders`;
  try {
    const response = await axios.get(ZENDROP_API_URL, {
      headers: {
        Authorization: `Bearer ${zendropToken}`,
        "Content-Type": "application/json",
      },
      params: {
        colmname,
        orderby,
        page,
        "filters[0][filter_by]": "fulfillment_status",
        "filters[0][filter_config][equals]": fulfillmentStatus,
      },
    });
    const allZendropOrders = response.data.data || [];
    const cancelledOrders = allZendropOrders.filter(
      (order: {
        order_status: string;
        store_order_id: string;
        is_cancelled_attribute: boolean;
        is_cancelled_status_attribute: boolean;
      }) =>
        order.order_status === "cancelled" ||
        order?.is_cancelled_attribute === true
    );
    // console.log(cancelledOrders, "cancel order");

    // const stored = await Promise.all(
    //   cancelledOrders.map(async (order: Order) => {
    //     const zendropShopifyId = order.store_order_id;
    //     await prisma.ebayOrder.findFirst({
    //       where: {
    //         shopifyOrderId: {
    //           endsWith: zendropShopifyId,
    //         },
    //       },
    //     });
    //     return prisma.cancelledOrder.upsert({
    //       where: { storeOrderId: zendropShopifyId },
    //       update: {
    //         isCancelledShopify: false,
    //         isCancelledEbay: false,
    //       },
    //       create: {
    //         storeOrderId: zendropShopifyId,
    //         isCancelledShopify: false,
    //         isCancelledEbay: false,
    //       },
    //     });
    //   })
    // );

    const stored = await Promise.all(
      cancelledOrders.map(async (order: Order) => {
        const zendropShopifyId = order.store_order_id;

        // First, find the ebayOrder
        const ebayOrder = await prisma.ebayOrder.findFirst({
          where: {
            formattedShopifyOrderId: {
              endsWith: zendropShopifyId, // Flexible match, or exact match if needed
            },
          },
          select: {
            ebayOrderid: true,
          },
          // include: {
          //   shippingAddress: true,
          //   billingAddress: true,
          //   orderItem: {
          //     include: {
          //       variant: true,
          //     },
          //   },
          //   payment: true,
          //   ebayShipment: true,
          //   ebayReturn: true,
          // },
        });

        if (!ebayOrder) {
          console.warn(
            `Skipping order. No EbayOrder found for storeOrderId: ${zendropShopifyId}`
          );
          return null; // ⛔ Skip this one
        }

        const existingCancelledOrder = await prisma.cancelledOrder.findUnique({
          where: { storeOrderId: zendropShopifyId },
        });
        // console.log(existingCancelledOrder, "exist");

        // Upsert cancelledOrder entry
        const cancelledOrder = await prisma.cancelledOrder.upsert({
          where: { storeOrderId: zendropShopifyId },
          update: {
            // Only update if not already true
            isCancelledShopify:
              existingCancelledOrder?.isCancelledShopify ?? false,
            isCancelledEbay: existingCancelledOrder?.isCancelledEbay ?? false,
          },
          create: {
            storeOrderId: zendropShopifyId,
            isCancelledShopify: false,
            isCancelledEbay: false,
          },
        });

        // console.log(cancelledOrder, ebayOrder, "stored inner");

        return {
          cancelledOrder,
          ebayOrder,
        };
      })
    );

    return NextResponse.json(stored, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Zendrop order fetch error:",
        error.response?.data || error.message
      );
      return NextResponse.json(
        {
          error: error.response?.data || "Failed to fetch orders from Zendrop",
        },
        { status: error.response?.status || 500 }
      );
    }

    // fallback for unexpected non-Axios errors
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
