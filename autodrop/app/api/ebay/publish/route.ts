import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { offerId } = await req.json();

        if (!offerId) {
            return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
        }

        const EBAY_TOKEN = await getEbayAccessToken();

        const response = await axios.post(
            `https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${EBAY_TOKEN}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        if (response.status !== 200) {
            throw new Error("Failed to publish offer");
        }

        const ebayListingId = response.data.listingId;

        await prisma.log.create({
            data: {
                action: "PUBLISH_EBAY_OFFER",
                details: `Published eBay offer ${offerId} as listing ${ebayListingId}`,
            },
        });

        return NextResponse.json({
            message: "Offer published successfully",
            ebayListingId,
        });
    } catch (error) {
        if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response) {
            console.error("eBay Publish Error:", JSON.stringify(error.response.data, null, 2));
        } else if (error && typeof error === "object" && "message" in error) {
            console.error("eBay Publish Error:", JSON.stringify(error.message, null, 2));
        } else {
            console.error("eBay Publish Error:", JSON.stringify(error, null, 2));
        }
        return NextResponse.json(
            { error: "Failed to publish offer" },
            { status: 500 }
        );
    }
}