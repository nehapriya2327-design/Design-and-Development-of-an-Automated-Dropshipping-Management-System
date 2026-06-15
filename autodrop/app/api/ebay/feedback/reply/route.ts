import { getEbayAccessToken } from "@/lib/server/ebayToken";
import axios from "axios";
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feedbackId, commentText, targetUserId } = body;
    console.log(feedbackId, commentText, targetUserId);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => name === "FeedbackDetail",
    });
    if (!feedbackId || !commentText || !targetUserId) {
      return NextResponse.json(
        { success: false, error: "feedbackId and commentText are required" },
        { status: 400 }
      );
    }
    const token = await getEbayAccessToken();
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<RespondToFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <FeedbackID>${feedbackId}</FeedbackID>
  <TargetUserID>${targetUserId}</TargetUserID>
  <ResponseType>Reply</ResponseType>
  <ResponseText>${commentText}</ResponseText>
</RespondToFeedbackRequest>`;

    const response = await axios.post("https://api.ebay.com/ws/api.dll", xml, {
      headers: {
        "X-EBAY-API-CALL-NAME": "RespondToFeedback",
        "X-EBAY-API-SITEID": "0",
        "X-EBAY-API-DEV-NAME": process.env.DEV_ID!,
        "X-EBAY-API-APP-NAME": process.env.APP_ID!,
        "X-EBAY-API-CERT-NAME": process.env.CLIENT_SECRET!,
        "X-EBAY-API-IAF-TOKEN": token,
        "X-EBAY-API-COMPATIBILITY-LEVEL": "1201",
        "Content-Type": "text/xml",
      },
    });
    const json = parser.parse(response.data);
    if (json?.RespondToFeedbackResponse?.Ack !== "Failure") {
      await prisma.ebayFeedback.update({
        where: { feedbackId: feedbackId },
        data: {
          feedbackResponse: commentText,
        },
      });
    }
    return NextResponse.json({
      success: true,
      rawResponse: json,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error responding to feedback:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
