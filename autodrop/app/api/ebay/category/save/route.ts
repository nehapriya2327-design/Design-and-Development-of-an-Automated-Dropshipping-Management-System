import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

export const POST = handlerWrapper(async (req: NextRequest) => {
    const { categoryId, categoryName, shopifyId } = await req.json();

    if (!categoryId || !categoryName) {
        throw createError.badRequest("categoryId and categoryName are required");
    }

    const parsedCategoryId = parseInt(categoryId);
    if (isNaN(parsedCategoryId)) {
        throw createError.badRequest("Invalid categoryId");
    }

    const category = await prisma.ebayCategory.upsert({
        where: { categoryId: parsedCategoryId },
        update: { name: categoryName.trim() },
        create: { categoryId: parsedCategoryId, name: categoryName.trim() },
    });

    let updatedProduct = null;
    if (shopifyId) {
        const gid = shopifyId.startsWith('gid://') ? shopifyId : `gid://shopify/Product/${shopifyId}`;
        const product = await prisma.product.findUnique({
            where: { shopifyId: gid },
            include: { variants: true }
        });

        if (!product) throw createError.notFound("Product not found");

        // Update product's category and readyToSync flag
        updatedProduct = await prisma.product.update({
            where: { shopifyId: gid },
            data: {
                categoryId: category.id,
            },
            include: { category: true, variants: true },
        });

        await prisma.log.create({
            data: {
                action: "UPDATE_PRODUCT_EBAY_CATEGORY",
                details: `Updated product ${shopifyId} to category ${parsedCategoryId}`,
            },
        });
    }

    return success(
        {
            category,
            updatedProduct: updatedProduct || "Provide Shopify ID for Product",
        },
        "Category saved successfully",
        201
    );
});
