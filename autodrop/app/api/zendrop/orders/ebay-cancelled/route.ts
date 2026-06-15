// import { getEbayAccessToken } from "@/lib/server/ebayToken";
// import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function Post(req: NextRequest) {
  const body = await req.json();
  const { ebayOrderId } = body;
  if (!ebayOrderId) {
    return NextResponse.json(
      { success: false, error: "Missing eBay Order ID" },
      { status: 400 }
    );
  }
  // const accessToken = await getEbayAccessToken();
  // const response= await axios.post("")
}
