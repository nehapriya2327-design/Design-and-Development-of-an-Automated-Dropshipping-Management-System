import prisma from "@/lib/prisma";
import { fetchShopifyGraphQL } from "@/lib/server/shopify";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;
    // console.log(id, "id");

    const ebayOrder = await prisma.ebayOrder.findUnique({
      where: { ebayOrderid: id },
      include: {
        shippingAddress: true,
        payment: true,
        orderItem: true,
      },
    });

    if (ebayOrder?.shopifyOrderId && ebayOrder.shopifyDraftOrderId) {
      return NextResponse.json({
        message: "Order already created and completed in Shopify.",
        shopifyOrderId: ebayOrder?.shopifyOrderId,
        shopifyDraftOrderId: ebayOrder?.shopifyDraftOrderId,
      });
    }

    const shippingAddress = ebayOrder?.shippingAddress;

    const lineItem = ebayOrder?.orderItem[0];
    const variant = await prisma.variant.findUnique({
      where: { sku: lineItem?.sku },
    });

    const mutation = `
  mutation {
    draftOrderCreate(input: {
      lineItems: [
        {
          quantity: ${lineItem?.quantity}
          variantId: "${variant?.shopifyId}"
          customAttributes: [
            { key: "ebay_order_id", value: "${ebayOrder?.ebayOrderid}" }
          ]
        }
      ],
      shippingAddress: {
        address1: "${shippingAddress?.addressLine1}",
        city: "${shippingAddress?.city}",
        provinceCode: "${shippingAddress?.state}",
        countryCode: ${shippingAddress?.country},
        zip: "${shippingAddress?.zipCode}",
        firstName: "${ebayOrder?.buyerName.split(" ")[0]}",
        lastName: "${ebayOrder?.buyerName.split(" ").slice(1).join(" ")}",
        phone: "${ebayOrder?.buyerPhoneNo || ""}"
      },
      email: "${ebayOrder?.buyerEmail}",
      useCustomerDefaultAddress: false,
      tags: ["eBay", "Zendrop"]
    }) {
      draftOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

    const response = (await fetchShopifyGraphQL(mutation)) as {
      draftOrderCreate: {
        draftOrder: {
          id: string;
        };
        userErrors: Array<{ field: string[]; message: string }>;
      };
    };

    const draftOrderId = response.draftOrderCreate.draftOrder.id;
    console.log(response, draftOrderId, "shopify");
    await prisma.ebayOrder.update({
      where: { ebayOrderid: id },
      data: {
        shopifyDraftOrderId: draftOrderId,
      },
    });
    // Complete the draft order to convert it into a paid order
    const completeMutation = `
      mutation {
        draftOrderComplete(id: "${draftOrderId}", paymentPending: false) {
          draftOrder {
            id
            order {
            id
          }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const completeResponse = (await fetchShopifyGraphQL(completeMutation)) as {
      draftOrderComplete: {
        draftOrder: {
          id: string;
          order: {
            id: string;
          };
        };
        userErrors: Array<{ field: string[]; message: string }>;
      };
    };

    await prisma.ebayOrder.update({
      where: { ebayOrderid: id },
      data: {
        shopifyOrderId: completeResponse.draftOrderComplete.draftOrder.order.id,
        formattedShopifyOrderId:
          completeResponse.draftOrderComplete.draftOrder.order.id
            .split("/")
            .pop(),
      },
    });
    return NextResponse.json({
      message: "Order created and marked as paid in Shopify.",
      draftOrderId,
      completeResponse: completeResponse.draftOrderComplete,
    });
  } catch (error) {
    let status = 500;
    let details: string | object = "Unknown error";
    if (typeof error === "object" && error !== null) {
      if (
        "response" in error &&
        typeof (error as { response?: { status?: number; data?: unknown } })
          .response === "object" &&
        (error as { response?: object }).response !== null
      ) {
        const err = error as { response?: { status?: number; data?: unknown } };
        status = err.response?.status ?? 500;
        details = err.response?.data ?? err.response ?? "Unknown error";
      } else if ("message" in error) {
        details = (error as { message: string }).message;
      }
    }

    return NextResponse.json(
      {
        error: true,
        status,
        details,
      },
      { status: 500 }
    );
  }
};
