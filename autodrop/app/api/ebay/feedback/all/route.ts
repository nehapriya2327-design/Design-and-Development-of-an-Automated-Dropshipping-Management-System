import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { NextResponse } from "next/server";

interface EbayFeedbackDetail {
  FeedbackID: string;
  CommentingUser: string;
  CommentText: string;
  CommentType: string;
  TransactionID: string;
  CommentTime: string;
}

export const GET = async () => {
  try {
    const apiAppName = process.env.APP_ID;
    const apiCertName = process.env.CLIENT_SECRET;
    const apiDevName = process.env.DEV_ID;
    // console.log(apiAppName);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => name === "FeedbackDetail",
    });
    const token = await getEbayAccessToken();
    const allFeedbackDetails: EbayFeedbackDetail[] = [];
    let pageNumber = 1;
    const entriesPerPage = 200; // max allowed by eBay
    const latestFeedback = await prisma.ebayFeedback.findFirst({
      orderBy: { createdAt: "desc" },
      select: { feedbackId: true },
    });
    const latestFeedbackId = latestFeedback?.feedbackId;
    let foundDuplicate = false;

    while (!foundDuplicate) {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <DetailLevel>ReturnAll</DetailLevel>
  <FeedbackType>FeedbackReceived</FeedbackType>
  <Pagination>
    <EntriesPerPage>${entriesPerPage}</EntriesPerPage>
    <PageNumber>${pageNumber}</PageNumber>
  </Pagination>
</GetFeedbackRequest>`;

      const response = await axios.post(
        "https://api.ebay.com/ws/api.dll",
        xml,
        {
          headers: {
            "X-EBAY-API-CALL-NAME": "GetFeedback",
            "X-EBAY-API-SITEID": "0",
            "X-EBAY-API-DEV-NAME": apiDevName,
            "X-EBAY-API-APP-NAME": apiAppName,
            "X-EBAY-API-CERT-NAME": apiCertName,
            "X-EBAY-API-IAF-TOKEN": token,
            "X-EBAY-API-COMPATIBILITY-LEVEL": "1201",
            "Content-Type": "text/xml",
          },
        }
      );

      const json = parser.parse(response.data);
      // console.log(json, "feedback");

      const pageFeedbacks =
        json?.GetFeedbackResponse?.FeedbackDetailArray?.FeedbackDetail || [];

      const feedbackArray = Array.isArray(pageFeedbacks)
        ? pageFeedbacks
        : [pageFeedbacks];

      for (const fb of feedbackArray) {
        const fbId = String(fb.FeedbackID);
        if (fbId === latestFeedbackId) {
          foundDuplicate = true;
          break;
        }
        allFeedbackDetails.push(fb);
      }

      // allFeedbackDetails.push(...feedbackArray);

      const paginationResult = json?.GetFeedbackResponse?.PaginationResult;
      const totalPages = Number(paginationResult?.TotalNumberOfPages || 1);

      if (pageNumber >= totalPages || foundDuplicate) break;

      pageNumber++;
    }

    await Promise.all(
      allFeedbackDetails.map((feedback) =>
        prisma.ebayFeedback.create({
          data: {
            feedbackId: String(feedback.FeedbackID),
            feedbackUser: feedback.CommentingUser,
            commentText: feedback.CommentText,
            commentType: feedback.CommentType,
            orderItemId: String(feedback.TransactionID),
            createdAt: new Date(feedback.CommentTime),
          },
        })
      )
    );

    // const feedbackIds = allFeedbackDetails.map((f) => String(f.FeedbackID));

    // await Promise.all(
    //   allFeedbackDetails.map(async (feedback) => {
    //     // console.log("TransactionID:", feedback.TransactionID);
    //     const existing = await prisma.ebayFeedback.findFirst({
    //       where: {
    //         feedbackId: String(feedback.FeedbackID),
    //       },
    //     });
    //     if (existing) return;
    //     return prisma.ebayFeedback.create({
    //       data: {
    //         feedbackId: String(feedback.FeedbackID),
    //         feedbackUser: feedback.CommentingUser,
    //         commentText: feedback.CommentText,
    //         commentType: feedback.CommentType,
    //         orderItemId: String(feedback.TransactionID), // Or store as string if needed
    //         createdAt: new Date(feedback.CommentTime),
    //       },
    //     });
    //   })
    // );

    const allFeedbacks = await prisma.ebayFeedback.findMany({
      include: {
        orderItem: {
          include: {
            variant: {
              select: {
                id: true,
                title: true,
                price: true,
                imageUrl: true,
                productId: true,
                formattedShopifyId: true,
                product: true, // Required to access `product.formattedShopifyId` later
              },
            },
            ebayOrder: {
              select: {
                shippingAddress: { select: { state: true, country: true } },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: allFeedbacks });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
};
