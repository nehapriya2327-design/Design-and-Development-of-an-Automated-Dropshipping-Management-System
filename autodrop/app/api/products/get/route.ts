// app/api/product/get/route.ts
import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest, NextResponse } from "next/server";

export const GET = handlerWrapper(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const shopifyId = searchParams.get("shopifyId");

    if (!shopifyId) {
        return NextResponse.json({ error: "Missing shopifyId" }, { status: 400 });
    }

    const gid = shopifyId.startsWith("gid://")
        ? shopifyId
        : `gid://shopify/Product/${shopifyId}`;

    const product = await prisma.product.findUnique({
        where: { shopifyId: gid },
        include: {
            variants: {
                include: {
                    variantOptions: true,
                },
            },
            productOptions: true,
            category: true,
            ebayListing: true,
        },
    });

    if (!product) {
        throw createError.notFound(`Product not found with shopifyId=${shopifyId}`);
    }

    // 🧩 Optional: Category aspects if assigned
    let requiredAspects: {
        name: string;
        required: boolean;
        aspectType: string;
        possibleValues: string[] | null;
    }[] = [];

    if (product.categoryId) {
        const rawAspects = await prisma.ebayAspect.findMany({
            where: {
                ebayCategoryId: product.categoryId,
                required: true,
            },
            select: {
                name: true,
                required: true,
                aspectType: true,
                possibleValues: true,
            },
        });

        requiredAspects = rawAspects.map((aspect) => {
            let values: string[] | null = null;

            if (Array.isArray(aspect.possibleValues)) {
                values = aspect.possibleValues.filter((v): v is string => typeof v === "string");
            } else if (typeof aspect.possibleValues === "string") {
                values = [aspect.possibleValues];
            } else if (typeof aspect.possibleValues === "number") {
                values = [aspect.possibleValues.toString()];
            }

            return {
                name: aspect.name,
                required: aspect.required,
                aspectType: aspect.aspectType,
                possibleValues: values,
            };
        });
    }

    await prisma.log.create({
        data: {
            action: "FETCH_PRODUCT_WITH_ASPECTS",
            details: `Fetched product with shopifyId=${shopifyId}; requiredAspects=${requiredAspects.length}`,
        },
    });

    return success(
        {
            product,
            requiredAspects,
        },
        "Product and aspects fetched successfully",
        200
    );
});
