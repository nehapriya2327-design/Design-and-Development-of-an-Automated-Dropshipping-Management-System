import { getEbayAccessToken } from "@/lib/server/ebayToken";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId, reason } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing OrderId" }, { status: 400 });
    }
    const accessToken = await getEbayAccessToken();
    const payload = {
      legacyOrderId: orderId,
      cancelReason: reason || "OUT_OF_STOCK_OR_CANNOT_FULFILL",
    };
    const response = await axios.post(
      "https://api.ebay.com/post-order/v2/cancellation",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "eBay Cancel Error:",
        error.response?.data || error.message
      );
      return NextResponse.json(
        {
          error:
            error.response?.data?.message ||
            "Failed to cancel eBay order (Axios)",
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected error during cancellation" },
      { status: 500 }
    );
  }
}
