import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import { success } from "@/lib/server/response";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// interface EbayShipment {
//     shopifyShipmentId: number;
//     fulfillmentId: string;
//     orderId: string;
//     carrier: string;
//     trackingNumber: string;
//     serviceCode: string;
//     trackingUrl: string;
//     lineItems?: { lineItemId: string }[];
//     createdAt: Date;
//     updatedAt: Date;
// }

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getEbayAccessToken();
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });
  }

  const shipment = await prisma.shopifyShipment.findFirst({
    include: { order: true },
    where: { id: parseInt(id) },
  });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { ebayOrderId: shipment.orderId },
  });

  if (orderItems.length == 0) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const items = [];
  for (const orderItem of orderItems) {
    items.push({ lineItemId: orderItem.lineItemId });
  }


  const data = {
    lineItems: items,
    shippedDate: shipment.createdAt,
    shippingCarrierCode: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
  };


  const ebayOrderId = shipment.order.ebayOrderid;
  try {
    const response = await axios.post(
      `https://api.ebay.com/sell/fulfillment/v1/order/${ebayOrderId}/shipping_fulfillment`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.status == 201) {
      const res = await axios.get(
        `https://api.ebay.com/sell/fulfillment/v1/order/${ebayOrderId}/shipping_fulfillment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (res.data.total > 0) {
          for (const fulfillment of res.data.fulfillments) {
              const shipmentData = {
                  shopifyShipmentId: shipment.id,
                  fulfillmentId: fulfillment.fulfillmentId,
                  orderId: shipment.orderId,
                  carrier: fulfillment.shippingCarrierCode,
                  trackingNumber: fulfillment.shipmentTrackingNumber,
                  serviceCode: fulfillment.shippingServiceCode,
                  trackingUrl: shipment.trackingUrl,
                  lineItems: fulfillment.lineItems,
                  createdAt: shipment.createdAt,
                  updatedAt: shipment.updatedAt,
              }

              await prisma.ebayShipment.create({ data: shipmentData }); // never used please review

          }
      }

      return success(res.data, "Ebay fulfillment created successfully.");
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      "message" in error
    ) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("eBay API error:", err.response?.data || err.message);
      return NextResponse.json(
        {
          error: "eBay API request failed",
          details: err.response?.data || err.message,
        },
        { status: 500 }
      );
    } else {
      console.error("eBay API error:", error);
      return NextResponse.json(
        {
          error: "eBay API request failed",
          details: String(error),
        },
        { status: 500 }
      );
    }
  }
}
