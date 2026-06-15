// app/api/product/update/route.ts

import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

export const PATCH = handlerWrapper(async function (req: NextRequest) {
    const body = await req.json();
    const { productId, categoryId } = body;

    // Input validation
    if (!productId || !categoryId) {
        throw createError.badRequest("Missing productId or categoryId", { productId, categoryId });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw createError.notFound(`Product not found with ID ${productId}`);
    }

    // Verify category exists
    const category = await prisma.ebayCategory.findUnique({
        where: { id: categoryId },
    });

    if (!category) {
        throw createError.notFound(`eBay category not found with ID ${categoryId}`);
    }

    // Perform update
    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { categoryId },
        include: {
            category: true,
            variants: true,
            productOptions: true,
            ebayListing: true,
        },
    });

    // Log action
    await prisma.log.create({
        data: {
            action: "UPDATE_PRODUCT_CATEGORY",
            details: `Updated product ID ${productId} with new category ID ${categoryId}`,
        },
    });

    return success(
        updatedProduct,
        "Product category updated successfully",
        204
    );
});
