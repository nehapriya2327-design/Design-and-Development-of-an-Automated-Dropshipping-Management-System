import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import { PaymentStatus } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";
// import { subDays, formatISO } from "date-fns";

// ---------- eBay API Response Types ----------

interface EbayAmount {
  value: string;
  currency?: string;
}

interface EbayTax {
  taxType: string;
  amount: EbayAmount;
  collectionMethod: string;
}

interface EbayLineItem {
  sku: string;
  lineItemId: string;
  lineItemCost: EbayAmount;
  total: EbayAmount;
  quantity: number;
  ebayCollectAndRemitTaxes: EbayTax[];
}

interface EbayPaymentHold {
  holdReason: string;
  holdAmount: EbayAmount;
  holdState: string;
  expectedReleaseDate?: string;
  releaseDate?: string;
}

interface EbayPayment {
  paymentReferenceId: string;
  paymentDate: string;
  amount: EbayAmount;
  paymentStatus: string;
  paymentHolds?: EbayPaymentHold[];
}

interface EbayContactAddress {
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  postalCode?: string;
  stateOrProvince?: string;
  countryCode?: string;
}

interface EbayPhone {
  phoneNumber?: string;
}

interface EbayBuyerAddress {
  fullName?: string;
  email?: string;
  primaryPhone?: EbayPhone;
  contactAddress?: EbayContactAddress;
}

interface EbayBuyer {
  buyerRegistrationAddress?: EbayBuyerAddress;
}

interface EbayFulfillmentStartInstruction {
  shippingStep?: {
    shipTo?: {
      fullName?: string;
      email?: string;
      primaryPhone?: EbayPhone;
      contactAddress?: EbayContactAddress;
    };
  };
}

interface EbayPricingSummary {
  total?: EbayAmount;
}

interface EbayPaymentSummary {
  payments?: EbayPayment[];
}

interface EbayOrder {
  orderId: string;
  buyer?: EbayBuyer;
  lineItems: EbayLineItem[];
  pricingSummary?: EbayPricingSummary;
  fulfillmentStartInstructions?: EbayFulfillmentStartInstruction[];
  orderFulfillmentStatus: string;
  paymentSummary?: EbayPaymentSummary;
  totalFeeBasisAmount?: EbayAmount;
  totalMarketplaceFee?: EbayAmount;
}

function mapEbayPaymentStatusToEnum(status: string): PaymentStatus {
  switch (status.toUpperCase()) {
    case "PENDING":
      return PaymentStatus.PENDING;
    case "PAID":
      return PaymentStatus.PAID;
    case "FAILED":
      return PaymentStatus.FAILED;
    default:
      throw new Error(`Unhandled paymentStatus: ${status}`);
  }
}
// ---------- API Handler ----------

export async function GET() {
  try {
    const token = await getEbayAccessToken();
    // const latestOrder = await prisma.ebayOrder.findFirst({
    //   orderBy: { createdAt: "desc" },
    //   select: { createdAt: true },
    // });
    // const createdAfter = latestOrder?.createdAt?.toISOString();
    // console.log(token,'token');
    const baseUrl = "https://api.ebay.com/sell/fulfillment/v1/order";
    // const url = createdAfter
    //   ? `${baseUrl}?filter=creationdate:[${createdAfter}..]`
    //   : baseUrl;
    const response = await axios.get<{ orders: EbayOrder[] }>(baseUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const orders = response.data.orders;

    const extractedOrders = await Promise.all(
      orders.map(async (order) => {
        const {
          orderId,
          buyer,
          lineItems,
          pricingSummary,
          fulfillmentStartInstructions,
          paymentSummary,
        } = order;

        const existingOrder = await prisma.ebayOrder.findUnique({
          where: { ebayOrderid: orderId },
          include: {
            shippingAddress: true,
            billingAddress: true,
            payment: true,
            orderItem: {
              include: {
                variant: {
                  select: {
                    imageUrl: true,
                    product: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (existingOrder) {
          // Update the order if relevant fields changed
          const shouldUpdate =
            existingOrder.orderFulfillmentStatus !==
              order.orderFulfillmentStatus ||
            (existingOrder.payment.length > 0 &&
              paymentSummary?.payments?.some(
                (p) =>
                  p.paymentStatus &&
                  existingOrder.payment?.[0]?.paymentStatus !==
                    mapEbayPaymentStatusToEnum(p.paymentStatus)
              ));

          if (shouldUpdate) {
            await prisma.ebayOrder.update({
              where: { ebayOrderid: orderId },
              data: {
                orderFulfillmentStatus: order.orderFulfillmentStatus,
                payment: {
                  deleteMany: {},
                  create:
                    paymentSummary?.payments?.map((payment) => ({
                      paymentReferenceId: payment.paymentReferenceId,
                      paymentDate: payment.paymentDate,
                      ebayPrice: parseFloat(payment.amount.value),
                      paymentStatus: mapEbayPaymentStatusToEnum(
                        payment.paymentStatus
                      ),
                      paymentHold: (payment.paymentHolds ?? []).map((hold) => ({
                        holdReason: hold.holdReason,
                        holdAmount: hold.holdAmount.value,
                        holdState: hold.holdState,
                        expectedReleaseDate: hold.expectedReleaseDate,
                        releaseDate: hold.releaseDate,
                      })),
                    })) ?? [],
                },
              },
            });
          }

          return existingOrder;
        }

        const shipTo = fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo;

        const buyerName =
          shipTo?.fullName || buyer?.buyerRegistrationAddress?.fullName || "";
        const buyerEmail =
          shipTo?.email || buyer?.buyerRegistrationAddress?.email || "";
        const buyerPhoneNo =
          shipTo?.primaryPhone?.phoneNumber ||
          buyer?.buyerRegistrationAddress?.primaryPhone?.phoneNumber ||
          "";

        const shippingContactAddress = shipTo?.contactAddress;

        const ebayOrder = await prisma.ebayOrder.create({
          data: {
            ebayOrderid: orderId,
            totalPrice: order.totalFeeBasisAmount?.value ?? "",
            ebayFee: order.totalMarketplaceFee?.value ?? "",
            ebayListingPrice: pricingSummary?.total?.value ?? "",
            orderFulfillmentStatus: order.orderFulfillmentStatus,
            buyerName,
            buyerEmail,
            buyerPhoneNo,
            billingAddress: {
              create: {
                type: "BILLING",
                addressLine1:
                  buyer?.buyerRegistrationAddress?.contactAddress
                    ?.addressLine1 || "",
                addressLine2:
                  buyer?.buyerRegistrationAddress?.contactAddress
                    ?.addressLine2 ?? null,
                city:
                  buyer?.buyerRegistrationAddress?.contactAddress?.city || "",
                zipCode:
                  buyer?.buyerRegistrationAddress?.contactAddress?.postalCode ||
                  "",
                state:
                  buyer?.buyerRegistrationAddress?.contactAddress
                    ?.stateOrProvince || "",
                country:
                  buyer?.buyerRegistrationAddress?.contactAddress
                    ?.countryCode || "",
              },
            },
            shippingAddress: {
              create: {
                type: "SHIPPING",
                addressLine1: shippingContactAddress?.addressLine1 || "",
                addressLine2: shippingContactAddress?.addressLine2 || null,
                city: shippingContactAddress?.city || "",
                zipCode: shippingContactAddress?.postalCode || "",
                state: shippingContactAddress?.stateOrProvince || "",
                country: shippingContactAddress?.countryCode || "",
              },
            },
            payment: {
              create:
                paymentSummary?.payments?.map((payment) => ({
                  paymentReferenceId: payment.paymentReferenceId,
                  paymentDate: payment.paymentDate,
                  ebayPrice: parseFloat(payment.amount.value),
                  paymentStatus: mapEbayPaymentStatusToEnum(
                    payment.paymentStatus
                  ),
                  paymentHold: (payment.paymentHolds ?? []).map((hold) => ({
                    holdReason: hold.holdReason,
                    holdAmount: hold.holdAmount.value,
                    holdState: hold.holdState,
                    expectedReleaseDate: hold.expectedReleaseDate,
                    releaseDate: hold.releaseDate,
                  })),
                })) ?? [],
            },
            orderItem: {
              create: lineItems?.map((item) => ({
                sku: item.sku,
                lineItemId: item.lineItemId,
                lineItemCost: item.lineItemCost.value,
                total: item.total.value,
                quantity: item.quantity,
                ebayCollectAndRemitTaxes: item.ebayCollectAndRemitTaxes.map(
                  (tax) => ({
                    taxType: tax.taxType,
                    amount: tax.amount.value,
                    collectionMethod: tax.collectionMethod,
                  })
                ),
              })),
            },
          },
          include: {
            orderItem: {
              include: {
                variant: {
                  select: {
                    imageUrl: true,
                    product: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return ebayOrder;
      })
    );

    return NextResponse.json({ data: extractedOrders });
  } catch (error) {
    let status = 500;
    let details = "Unknown error";

    if (axios.isAxiosError(error) && error.response) {
      status = error.response.status ?? 500;
      details = (error.response.data as string) ?? error.message;
    } else if (error instanceof Error) {
      details = error.message;
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
}


