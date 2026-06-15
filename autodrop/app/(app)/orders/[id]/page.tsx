"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { request } from "@/lib/api/handler";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
// import { useRouter } from "next/router";

type OrderItemTax = {
  amount: string;
  taxType: string;
  collectionMethod: string;
};

type Variant = {
  imageUrl: string;
};

type OrderItem = {
  id: number;
  sku: string;
  lineItemId: string;
  lineItemCost: string;
  total: string;
  quantity: number;
  ebayCollectAndRemitTaxes: OrderItemTax[];
  variant: Variant;
};

type PaymentHold = {
  holdState: string;
  holdAmount: string;
  holdReason: string;
  releaseDate: string;
  expectedReleaseDate: string;
};

type Payment = {
  id: number;
  paymentReferenceId: string;
  paymentDate: string;
  ebayPrice: number;
  shopifyPrice: number;
  paymentStatus: string;
  paymentHold: PaymentHold[];
};

type ShippingAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type ShopifyShipment = {
  id: number;
};

type OrderData = {
  id: number;
  ebayOrderid: string;
  totalPrice: string;
  ebayFee: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhoneNo: string;
  shopifyOrderId: string;
  shippingAddress: ShippingAddress;
  orderItem: OrderItem[];
  payment: Payment[];
  shopifyShipment: ShopifyShipment[];
  shopifyOrderCancelReason: string;
  shopifyOrderCancelAt: string;
};

type OrderApiResponse = {
  success: boolean;
  order: OrderData;
};

interface CreateShopifyOrderResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

const Order = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [order, setOrder] = useState<OrderData>();
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async (id: string) => {
    try {
      const response: OrderApiResponse = await request({
        method: "GET",
        url: `ebay/order/byId?id=${id}`,
      });

      setOrder(response?.order);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopifyOrderDetail = async (id: string) => {
    try {
      const response: OrderApiResponse = await request({
        method: "GET",
        url: `shopify/order/getOrderDetailsById?id=${id}`,
      });
      if (response) {
        console.log(response);
      }
      // setOrder(response?.order);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await fetchShopifyOrderDetail(id); // ⬅️ This runs first
        await fetchOrderDetail(id); // ⬅️ This runs after
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">Loading...</div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-10 text-red-600 text-lg">
        Order not found
      </div>
    );
  }

  const createShopifyOrder = async (id: string) => {
    const response = await request<CreateShopifyOrderResponse>({
      method: "POST",
      url: "/shopify/order/createOrder",
      data: { id },
    });
    if (response) {
      fetchOrderDetail(id);
    }
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="flex justify-between">
      <span className="font-semibold w-40">{label}:</span>
      <span className="text-right flex-1">{value}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto mt-10 px-4 space-y-8"
    >
      {/* Order Summary */}
      <Card className="shadow-lg rounded-2xl bg-white">
        <CardContent className="px-6 space-y-4 text-gray-800">
          <div className="flex  items-center justify-between">
            <h2 className="text-3xl font-bold text-black mb-2">
              Order #{order.ebayOrderid}
            </h2>
            {order?.shopifyShipment[0]?.id && (
              <button
                className="bg-[#7695e7] ml-3 hover:bg-[#6185ea] text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all"
                onClick={() => {
                  router.push(
                    `/shopify-fulfillments/${order?.shopifyShipment?.[0].id}`
                  );
                  // console.log("Creating Shopify Order...");
                }}
              >
                View Fulfillment
              </button>
            )}
            {!order?.shopifyOrderId && (
              <div className="pt-4 gap-3 text-center">
                <button
                  className="bg-[#7695e7] hover:bg-[#6185ea] text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all"
                  onClick={() => {
                    createShopifyOrder(order.ebayOrderid);
                    // console.log("Creating Shopify Order...");
                  }}
                >
                  Create Shopify Order
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
            <InfoRow label="Buyer" value={order.buyerName} />
            <InfoRow label="Email" value={order.buyerEmail} />
            <InfoRow label="Phone" value={order.buyerPhoneNo} />
            <InfoRow label="Total Price" value={`$${order.totalPrice}`} />
            <InfoRow label="eBay Fee" value={`$${order.ebayFee}`} />
            {order.shopifyOrderId && (
              <>
                <InfoRow
                  label="Shopify Order Id"
                  value={`${order.shopifyOrderId}`}
                />
                {order.shopifyOrderCancelReason && (
                  <InfoRow
                    label="Shopify Cancel Reason"
                    value={`${order.shopifyOrderCancelReason}`}
                  />
                )}
                {order.shopifyOrderCancelAt && (
                  <InfoRow
                    label="Shopify Cancel At"
                    value={`${order.shopifyOrderCancelAt}`}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping */}
        <Card className="shadow-md rounded-2xl bg-white">
          <CardContent className="p-6 space-y-4 text-gray-800">
            <h3 className="text-xl font-bold text-black">Shipping Address</h3>
            <InfoRow
              label="Address"
              value={`${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2}`}
            />
            <InfoRow
              label="City/State/ZIP"
              value={`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`}
            />
            <InfoRow label="Country" value={order.shippingAddress.country} />
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="shadow-md rounded-2xl bg-white">
          <CardContent className="px-6 space-y-3 text-gray-800">
            <h3 className="text-xl font-bold text-black">Payment Details</h3>
            {order.payment.map((pay: Payment, index: number) => (
              <div
                key={index}
                className="border p-4 rounded-xl bg-gray-50 space-y-2"
              >
                <InfoRow label="Reference ID" value={pay.paymentReferenceId} />
                <InfoRow label="Status" value={pay.paymentStatus} />
                <InfoRow label="eBay Price" value={`$${pay.ebayPrice}`} />
                {pay.paymentHold?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Hold Info:</p>
                    <ul className="ml-4 list-disc text-sm space-y-1">
                      {pay.paymentHold.map(
                        (hold: PaymentHold, hIndex: number) => (
                          <li key={hIndex}>
                            {hold.holdReason} - ${hold.holdAmount} (Release:{" "}
                            {new Date(
                              hold.expectedReleaseDate
                            ).toLocaleDateString()}
                            )
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="shadow-lg rounded-2xl bg-white">
        <CardContent className="px-6 space-y-6 text-gray-800">
          <h3 className="text-xl font-bold text-black">Items</h3>
          {order.orderItem.map((item: OrderItem, index: number) => (
            <div
              key={index}
              className="flex gap-4 border p-4 rounded-xl bg-gray-50"
            >
              <Image
                src={item.variant?.imageUrl}
                alt="Item"
                width={96}
                height={96}
                className="w-24 h-24 object-contain rounded-md border"
              />
              <div className="flex-1 space-y-2">
                <InfoRow label="SKU" value={item.sku} />
                <InfoRow label="Quantity" value={item.quantity} />
                <InfoRow
                  label="Line Item Cost"
                  value={`$${item.lineItemCost}`}
                />
                <InfoRow label="Total" value={`$${item.total}`} />

                {item.ebayCollectAndRemitTaxes?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Taxes:</p>
                    <ul className="ml-4 list-disc text-sm space-y-1">
                      {item.ebayCollectAndRemitTaxes.map(
                        (tax: OrderItemTax, i: number) => (
                          <li key={i}>
                            {tax.taxType}: ${tax.amount} ({tax.collectionMethod}
                            )
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Order;
