import prisma from "@/lib/prisma";
import axios, { AxiosError } from "axios";
import { getEbayAccessToken } from "./ebayToken";

// Type for returned structure
// interface EbayShipment {
//   shopifyShipmentId: number;
//   fulfillmentId: string;
//   orderId: string;
//   carrier: string;
//   trackingNumber: string;
//   serviceCode: string;
//   trackingUrl: string;
//   lineItems?: any; // Replace with exact type if known
//   createdAt: Date;
//   updatedAt: Date;
// }

interface EbayApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export async function ebayFulfillments(): Promise<EbayApiResponse> {
  try {
    const ebayToken = await getEbayAccessToken();

    const shipments = await prisma.shopifyShipment.findMany({
      include: { order: true },
      where: { ebayShipment: { none: {} } },
    });
  
    
    if (!shipments.length) {
      return { status: "success", message: "No shipments to process." };
    }

    // Define types for order items and fulfillment
    type OrderItem = {
      lineItemId: string;
      ebayOrderId: string;
    };

    type Fulfillment = {
      fulfillmentId: string;
      shippingCarrierCode: string;
      shipmentTrackingNumber: string;
      shippingServiceCode: string;
      lineItems: { lineItemId: string }[];
    };

    for (const shipment of shipments) {
      const dbOrderItems = await prisma.orderItem.findMany({
        where: { ebayOrderId: shipment.orderId },
      });

      if (!dbOrderItems.length) continue;

      const orderItems: OrderItem[] = dbOrderItems.map((item) => ({
        lineItemId: item.lineItemId,
        ebayOrderId: String(item.ebayOrderId),
      }));

      const lineItems = orderItems.map((item) => ({
        lineItemId: item.lineItemId,
      }));

      const requestBody = {
        lineItems,
        shippedDate: shipment.createdAt.toISOString(),
        shippingCarrierCode: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
      };

      const ebayOrderId = shipment.order.ebayOrderid;

      // POST Fulfillment
      const postResponse = await axios.post(
        `https://api.ebay.com/sell/fulfillment/v1/order/${ebayOrderId}/shipping_fulfillment`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${ebayToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (postResponse.status !== 201) {
        throw new Error(
          `Failed to create fulfillment for eBay Order: ${ebayOrderId}`
        );
      }

      // GET Fulfillment data
      const getResponse = await axios.get(
        `https://api.ebay.com/sell/fulfillment/v1/order/${ebayOrderId}/shipping_fulfillment`,
        {
          headers: {
            Authorization: `Bearer ${ebayToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

 

      const fulfillments: Fulfillment[] = getResponse.data.fulfillments || [];


      for (const fulfillment of fulfillments) {
        const shipmentData = {
          shopifyShipmentId: shipment.id,
          fulfillmentId: fulfillment.fulfillmentId,
          orderId: Number(shipment.orderId),
          carrier: fulfillment.shippingCarrierCode || shipment.carrier,
          trackingNumber: fulfillment.shipmentTrackingNumber,
          serviceCode: fulfillment.shippingServiceCode,
          trackingUrl: shipment.trackingUrl,
          lineItems: fulfillment.lineItems,
          createdAt: shipment.createdAt,
          updatedAt: shipment.updatedAt,
        };

        await prisma.ebayShipment.create({ data: shipmentData });
      }
    }

    return {
      status: "success",
      message: "All shipments processed successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;

      console.error(
        "eBay Fulfillment Error:",
        axiosError.response?.data || axiosError.message
      );

      return {
        status: "error",
        message: axiosError.message || "Unknown error during fulfillment.",
      };
    } else {
      console.error("eBay Fulfillment Error:", error);
      return {
        status: "error",
        message: "Unknown error during fulfillment.",
      };
    }
  }
}

export async function fetchEbayReturns(): Promise<EbayApiResponse> {
  try {
    const ebayToken = await getEbayAccessToken();

    const response = await axios.get(
      `https://api.ebay.com/post-order/v2/return/search`,
      {
        headers: {
          Authorization: `TOKEN ${ebayToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      }
    );

    const ebayReturns = [];

    if (response.data?.returns?.length) {
      for (const orderReturn of response.data.returns) {
        const data = {
          ebayReturnId: orderReturn.returnId,
          currentType: orderReturn.currentType,
          orderId: 2,
          creationDate: orderReturn?.creationInfo?.creationDate?.value,
          itemId: orderReturn?.creationInfo?.item?.itemId,
          transactionId: orderReturn?.creationInfo?.item?.transactionId,
          returnQuantity: orderReturn?.creationInfo?.item?.returnQuantity,
          reason: orderReturn?.creationInfo?.reason,
          type: orderReturn?.creationInfo?.type,
          buyerTotalRefund:
            orderReturn?.buyerTotalRefund?.estimatedRefundAmount?.value || 0,
          sellerTotalRefund:
            orderReturn?.sellerTotalRefund?.estimatedRefundAmount?.value || 0,
          status: orderReturn.status,
        };

        const ebayReturn = await prisma.ebayReturn.create({ data: data });

        ebayReturns.push(ebayReturn);
      }
    }

    return { status: "success", data: ebayReturns };
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;

      console.error(
        "eBay Returns Error:",
        axiosError.response?.data || axiosError.message
      );

      return {
        status: "error",
        message: axiosError.message || "Failed to fetch eBay returns.",
      };
    } else {
      console.error("eBay Returns Error:", error);
      return {
        status: "error",
        message: "Failed to fetch eBay returns.",
      };
    }
  }
}

export const getEbayOrderByEbayOrderId = async (id: string) => {
  return prisma.ebayOrder.findUnique({
    where: { ebayOrderid: id },
    include: {
      shippingAddress: true,
      payment: true,
      orderItem: true,
    },
  });
};
