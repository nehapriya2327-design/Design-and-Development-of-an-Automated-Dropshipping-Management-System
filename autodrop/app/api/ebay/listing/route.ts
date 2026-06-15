import { request } from "@/lib/api/handler";
import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

interface Aspects {
    [key: string]: string[];
}

export const POST = handlerWrapper(async (req: NextRequest) => {
    const { shopifyId }: { shopifyId: string } = await req.json();

    if (!shopifyId) {
        return success({}, "Missing shopifyId", 404);
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createError.unauthorized("Missing or invalid Bearer token");
    }
    const token = authHeader.split(" ")[1];

    const shopifyGid = shopifyId.startsWith("gid://")
        ? shopifyId
        : `gid://shopify/Product/${shopifyId}`;

    const product = await prisma.product.findUnique({
        where: { shopifyId: shopifyGid },
        include: {
            category: true,
            variants: true,
            ebayListing: true,
        },
    });

    if (!product) return success({}, "Product not found", 404);
    if (!product.category) return success({}, "Product has no assigned eBay category", 400);

    // 🧩 Get required aspects for this category
    const requiredAspects = await prisma.ebayAspect.findMany({
        where: {
            ebayCategoryId: product.categoryId!,
            required: true,
        },
    });

    if (!requiredAspects.length) {
        return success({}, "No required aspects found for the category", 400);
    }

    // ✅ Only build aspects object from SELECTION_ONLY fields with values
    const localAspects: Aspects = {};
    for (const aspect of requiredAspects) {
        if (aspect.aspectType === "SELECTION_ONLY" || aspect.aspectType === "FREE_TEXT") {
            localAspects[aspect.name] = Array.isArray(aspect.possibleValues)
                ? aspect.possibleValues.map(String)
                : [];
        }
    }

    console.log("Local Aspects:", localAspects);


    // 🤖 Call Gemini with product + aspect options
    const geminiRes = await request({
        method: "POST",
        url: `/ai/gemini`,
        data: {
            productData: product,
            aspects: localAspects, // Only includes selection-based ones
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }) as {
        decoded: {
            aspects?: Aspects;
        };
        message?: string;
    };

    const inventoryData = geminiRes.decoded || {};

    // 🛡️ Fallback: ensure at least the SELECTION_ONLY values go to eBay
    if (!inventoryData.aspects || Object.keys(inventoryData.aspects).length === 0) {
        inventoryData.aspects = localAspects;
    }

    console.log("Inventory Data to send:", JSON.stringify(inventoryData, null, 2));

    // return;
    // 📦 Send to eBay Inventory API
    const inventoryResponse = await request({
        method: "POST",
        url: `/ebay/inventory`,
        data: {
            shopifyId: product.shopifyId,
            inventoryData,
        },
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return success(
        { inventoryResponse },
        "eBay listing route completed successfully",
        200
    );
});
