import { request } from "@/lib/api/handler";
import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import { createError } from "@/lib/server/error";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// Helper to safely parse number values
function parseNumber(value: unknown, fallback: number = 0): number {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return isNaN(num) ? fallback : num;
}

// Dynamically build inventory payload from the incoming data
type InventoryAspect = Record<string, string[]>;
type InventoryProduct = {
    title?: string;
    description?: string;
    imageUrls?: string[];
    aspects?: InventoryAspect;
    ean?: string[];
};
type InventoryDimensions = {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
};
type InventoryWeight = {
    value?: number;
    unit?: string;
};
type InventoryPackageWeightAndSize = {
    weight?: InventoryWeight;
    dimensions?: InventoryDimensions;
    packageType?: string;
    shippingIrregular?: boolean;
};
type InventoryAvailability = {
    shipToLocationAvailability?: {
        quantity?: number;
    };
    quantity?: number;
};
type InventoryItem = {
    availability?: InventoryAvailability;
    condition?: string;
    product?: InventoryProduct;
    packageWeightAndSize?: InventoryPackageWeightAndSize;
};

function buildInventoryPayload(inventoryItem: InventoryItem) {
    const prod = inventoryItem.product || {};
    const dim = inventoryItem.packageWeightAndSize?.dimensions || {};
    const weight = inventoryItem.packageWeightAndSize?.weight || {};

    return {
        availability: {
            shipToLocationAvailability: {
                // quantity: parseNumber(
                //     inventoryItem.availability?.shipToLocationAvailability?.quantity ??
                //     inventoryItem.availability?.quantity,
                //     1
                // ),
                quantity: 2, // Default to 2 for testing
            },
        },
        condition: inventoryItem.condition || "NEW",
        product: {
            title: prod.title || "Untitled",
            description: prod.description || "",
            imageUrls: prod.imageUrls || [],
            aspects: prod.aspects || {},
        },
        packageWeightAndSize: {
            weight: {
                value: parseNumber(weight.value, 0.5),
                unit: weight.unit || "KILOGRAM",
            },
            dimensions: {
                length: parseNumber(dim.length, 1),
                width: parseNumber(dim.width, 1),
                height: parseNumber(dim.height, 1),
                unit: dim.unit || "CENTIMETER",
            },
            packageType: "PACKAGE_THICK_ENVELOPE",
            shippingIrregular: inventoryItem.packageWeightAndSize?.shippingIrregular ?? false,
        },
    };
}

export async function POST(req: NextRequest) {
    try {
        const { shopifyId, inventoryData } = await req.json();

        // Validate input
        if (!inventoryData) {
            return NextResponse.json({ error: "Missing inventoryData" }, { status: 400 });
        }
        console.log("Provided aspects in inventory item:", inventoryData || {});

        const inventoryItem = inventoryData;
        // const sku = shopifyId + (inventoryItem.sku || `-${Date.now()}`); // generate random SKU
        const sku = 'test12'

        // Token For future requests
        // 🔐 Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createError.unauthorized("Missing or invalid Bearer token");
        }
        const token = authHeader.split(" ")[1];

        // Fetch product from DB
        const product = await prisma.product.findUnique({
            where: { shopifyId },
            include: {
                category: true,
                variants: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (!product.category) {
            return NextResponse.json({ error: "Product has no assigned eBay category" }, { status: 400 });
        }

        // Validate required aspects from DB
        const requiredAspects = await prisma.ebayAspect.findMany({
            where: {
                ebayCategoryId: product.category.id,
                required: true,
            },
        });

        console.log("Required aspects for category:", requiredAspects);

        const requiredAspectNames = requiredAspects.map((a: { name: string }) => a.name);
        const providedAspectNames = Object.keys(inventoryItem.product?.aspects || {});
        const missingAspects = requiredAspectNames.filter(
            (name: string) => !providedAspectNames.includes(name)
        );

        if (missingAspects.length > 0) {
            return NextResponse.json(
                { error: `Missing required aspects: ${missingAspects.join(", ")}` },
                { status: 400 }
            );
        }

        // Build payload and send to eBay
        const inventoryPayload = buildInventoryPayload(inventoryItem);

        console.log("Inventory payload to eBay:", JSON.stringify(inventoryPayload, null, 2));

        const EBAY_TOKEN = await getEbayAccessToken();

        const response = await axios.put(
            `https://api.ebay.com/sell/inventory/v1/inventory_item/${sku + product.formattedShopifyId}`,
            inventoryPayload,
            {
                headers: {
                    Authorization: `Bearer ${EBAY_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "Content-Language": "en-US",
                },
            }
        );

        if (![200, 204].includes(response.status)) {
            throw new Error(`Failed to create inventory item: ${response.statusText}`);
        }

        const offerRes = await request({
            method: 'POST',
            url: `/ebay/offer`,
            data: { shopifyId: product.shopifyId, sku: sku + product.formattedShopifyId },
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        }) as { offerId?: string };

        if (!offerRes.offerId) throw createError.badRequest("Failed to create eBay offer");

        // Call publish endpoint
        const publishRes = await request({
            method: 'POST',
            url: `/ebay/publish`,
            data: { offerId: offerRes.offerId },
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        // Log success
        await prisma.log.create({
            data: {
                action: "CREATE_EBAY_INVENTORY_ITEM",
                details: `Created eBay inventory item with SKU ${sku}`,
            },
        });

        return NextResponse.json({
            message: "Inventory item created successfully",
            sku,
            payload: { ...(typeof publishRes === "object" && publishRes !== null ? publishRes : {}) },
        });
    } catch (error) {
        // console.error("Error creating eBay inventory item:", error.response);
        let errorMessage: string;
        if (typeof error === "object" && error !== null && "response" in error) {
            const err = error as { response?: { data?: { errors?: unknown } }, message?: string };
            errorMessage = err.response?.data?.errors
                ? JSON.stringify(err.response.data.errors)
                : err.message || "Unknown error";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = String(error);
        }
        console.error("eBay Inventory Error:", errorMessage);
        return NextResponse.json(
            { error: `Failed to create inventory item: ${errorMessage}` },
            { status: 500 }
        );
    }
}
