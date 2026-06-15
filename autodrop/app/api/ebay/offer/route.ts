import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { shopifyId, sku } = await req.json();

        console.log("Creating eBay offer for shopifyId:", shopifyId, "with SKU:", sku);

        if (!shopifyId || !sku) {
            return NextResponse.json({ error: "Missing shopifyId or sku" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { shopifyId },
            include: {
                category: true,
                variants: true,
            },
        });

        if (!product) {
            console.error("Product not found for shopifyId:", shopifyId);
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (!product.category) {
            return NextResponse.json({ error: "Product has no assigned eBay category" }, { status: 400 });
        }

        const primaryVariant = product.variants[0];

        const offer = {
            sku: sku,
            marketplaceId: "EBAY_US",
            merchantLocationKey: "store1", // Update if needed
            format: "FIXED_PRICE",
            // availableQuantity: primaryVariant.inventory,
            availableQuantity: 2, // For testing purposes
            listingDescription: product.description.replace(/<[^>]+>/g, ""),
            listingPolicies: {
                fulfillmentPolicyId: "270608293015",
                paymentPolicyId: "270640994015",
                returnPolicyId: "270641045015",
            },
            // categoryId: product.category.categoryId.toString(),
            categoryId: "88433", // Every Other Thing Else Category
            pricingSummary: {
                price: {
                    value: primaryVariant.price.toString(),
                    currency: "USD",
                },
            },
        };

        const EBAY_TOKEN = await getEbayAccessToken();
        
        const response = await axios.post(
            `https://api.ebay.com/sell/inventory/v1/offer`,
            offer,
            {
                headers: {
                    Authorization: `Bearer ${EBAY_TOKEN}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Content-Language": "en-US",
                },
            }
        );

        if (response.status !== 201) {
            throw new Error("Failed to create offer");
        }

        const offerId = response.data.offerId;

        await prisma.log.create({
            data: {
                action: "CREATE_EBAY_OFFER",
                details: `Created eBay offer ${offerId} for product shopifyId ${shopifyId} with SKU ${sku}`,
            },
        });

        return NextResponse.json({
            message: "Offer created successfully",
            offerId,
            offer,
        });
    } catch (error) {
        if (error && typeof error === "object") {
            const err = error as { response?: { data?: unknown }, message?: unknown };
            console.error(
                "eBay Offer Error:",
                JSON.stringify(err.response?.data, null, 2) || JSON.stringify(err.message, null, 2)
            );
        } else {
            console.error("eBay Offer Error:", String(error));
        }
        return NextResponse.json(
            { error: "Failed to create offer" },
            { status: 500 }
        );
    }
}