import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { ebayEndpoints } from "@/utils/endpoints";
import axios from "axios";
import { NextRequest } from "next/server";

export const GET = handlerWrapper(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const shopifyId = searchParams.get("shopifyId");

    if (!shopifyId) throw createError.badRequest("Missing shopifyId");

    const gid = shopifyId.startsWith('gid://') ? shopifyId : `gid://shopify/Product/${shopifyId}`;
    const product = await prisma.product.findUnique({ where: { shopifyId: gid } });

    // if (!product) throw createError.notFound("Product not found");
    if (!product) return success({}, "Product not found", 404);

    const query = encodeURIComponent(
        `${product.title} ${product.description}`.slice(0, 500)
    );

    // Get Ebay Access Token
    const ebayToken = await getEbayAccessToken();

    const response = await axios({
        method: ebayEndpoints.get_category_suggestions.method,
        url: ebayEndpoints.get_category_suggestions.url,
        params: { q: query },
        headers: { Authorization: `Bearer ${ebayToken}` },
    });

    const suggested = response.data?.categorySuggestions?.[0]?.category;
    // const suggested = response.data?.categorySuggestions;
    if (!suggested) throw createError.notFound("No category suggestions");

    // Create formated AI suggestions
    const formattedSuggestions = response.data?.categorySuggestions.map((cat: { category: { categoryId: string; categoryName: string } }) => ({
        categoryId: cat.category.categoryId,
        categoryName: cat.category.categoryName,
    }));

    return success({
        categoryId: suggested.categoryId,
        categoryName: suggested.categoryName,
        data: formattedSuggestions,
    }, "Category suggested successfully");
    // return success(suggested, "Category suggested successfully");
});
