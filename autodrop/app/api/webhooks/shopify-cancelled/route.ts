import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";

export async function POST(req: NextRequest) {
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const bodyBuffer = await req.text();
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(bodyBuffer, "utf8")
    .digest("base64");
  if (hash !== hmac) return NextResponse.json({ message: "Invalid HMAC" }, { status: 401 });

  const data = JSON.parse(bodyBuffer);
  const shopifyOrderId = data.id.toString();

  const dbOrder = await prisma.ebayOrder.findFirst({
    where: { shopifyOrderId },
    select: { ebayOrderid: true, id: true },
  });
  if (!dbOrder) return NextResponse.json({ message: "Unknown order" }, { status: 404 });

  // Cancel order on eBay
  const ebayToken = await getEbayAccessToken();
  try {
    await axios.post(
      `https://api.ebay.com/sell/fulfillment/v1/order/${dbOrder.ebayOrderid}/cancel`,
      { cancelReason: "BUYER_ASKED_CANCEL" },
      {
        headers: {
          Authorization: `Bearer ${ebayToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Cancel eBay Failed", err);
    return NextResponse.json({ message: "eBay cancel failed" }, { status: 500 });
  }

  // await prisma.ebayOrder.update({
  //   where: { id: dbOrder.id },
  //   data: {  },
  // });

  return NextResponse.json({ status: "ok" });
}