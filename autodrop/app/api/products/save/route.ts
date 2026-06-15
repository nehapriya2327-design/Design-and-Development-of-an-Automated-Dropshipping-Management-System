import { request } from "@/lib/api/handler";
import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { getProductByIdGraphQL } from "@/lib/server/shopify";
import { NextRequest } from "next/server";

// Default config from env
const DEFAULTS = {
    FIXED_FEE_LOW: parseFloat(process.env.EBAY_FIXED_FEE_LOW || "0.35"),
    FIXED_FEE_HIGH: parseFloat(process.env.EBAY_FIXED_FEE_HIGH || "0.45"),
    FIXED_FEE_THRESHOLD: parseFloat(process.env.EBAY_FIXED_FEE_THRESHOLD || "10"),
    CATEGORY_FEE: parseFloat(process.env.EBAY_CATEGORY_FEE_PERCENT || "15"),
    SALES_TAX: parseFloat(process.env.EBAY_SALES_TAX_PERCENT || "8.5"),
    PROFIT_MARGIN: parseFloat(process.env.EBAY_DEFAULT_PROFIT_MARGIN || "0"),
};

// 🧠 Dummy method – replace with real auth logic
async function getUserIdFromToken(): Promise<number> {
    const user = await prisma.user.findFirst({ where: { email: { not: "" } } });
    if (!user) throw createError.unauthorized("User not found for token");
    return user.id;
}

export const POST = handlerWrapper(async (req: NextRequest) => {
    const body = await req.json();
    const { productId } = body;
    if (!productId) throw createError.badRequest("Missing productId");

    const shopifyId = productId.startsWith("gid://")
        ? productId
        : `gid://shopify/Product/${productId}`;

    const exists = await prisma.product.findUnique({ where: { shopifyId } });
    if (exists) throw createError.conflict("Product already exists");

    const productData = await getProductByIdGraphQL(productId);
    if (!productData) throw createError.notFound("Product not found on Shopify");

    // Auth & user config
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createError.unauthorized("Missing or invalid Bearer token");
    }
    const token = authHeader.split(" ")[1];
    const userId = await getUserIdFromToken();

    const userConfig = await prisma.configuration.findUnique({ where: { userId } });

    const useCustomConfig = !!userConfig;

    const SALES_TAX = userConfig?.salesTax ?? DEFAULTS.SALES_TAX;
    const CATEGORY_FEE = userConfig?.categoryFee ?? DEFAULTS.CATEGORY_FEE;
    const PROFIT_MARGIN = userConfig?.profitMargin ?? DEFAULTS.PROFIT_MARGIN;
    const FIXED_FEE_LOW = DEFAULTS.FIXED_FEE_LOW;
    const FIXED_FEE_HIGH = DEFAULTS.FIXED_FEE_HIGH;
    const FIXED_FEE_THRESHOLD = DEFAULTS.FIXED_FEE_THRESHOLD;

    const variantCreatePayload = productData.variants.map((variant) => {
        const isSingle = productData.variants.length === 1;
        const basePrice = isSingle
            ? parseFloat(String(productData.price)) || 0
            : parseFloat(String(variant.price)) || 0;

        const salesTaxAmount = (basePrice * SALES_TAX) / 100;
        const categoryFeeAmount = ((basePrice + salesTaxAmount) * CATEGORY_FEE) / 100;
        const fixedFee = basePrice <= FIXED_FEE_THRESHOLD ? FIXED_FEE_LOW : FIXED_FEE_HIGH;

        const adjustedPrice = basePrice + salesTaxAmount + categoryFeeAmount + fixedFee;
        const profitAmount = adjustedPrice * PROFIT_MARGIN / 100;
        const finalPrice = adjustedPrice + profitAmount;

        return {
            shopifyId: variant.shopifyId,
            formattedShopifyId: variant.formattedId,
            title: variant.title,
            sku: variant.sku || `SKU-${variant.formattedId}`,
            price: basePrice,
            compareAtPrice: variant.compareAtPrice ? parseFloat(String(variant.compareAtPrice)) : null,
            inventory: variant.inventory || 0,
            imageUrl: variant.imageUrl || null,
            imageAlt: variant.imageAlt || null,
            listedOnEbay: false,
            readyToSync: false,
            adjustedPrice,
            finalPrice,
            variantOptions: {
                create: variant.selectedOptions.map((opt) => ({
                    name: opt.name,
                    value: opt.value,
                })),
            },
        };
    });

    const product = await prisma.product.create({
        data: {
            shopifyId: productData.shopifyId,
            formattedShopifyId: productData.formattedId,
            title: productData.title,
            description: productData.description,
            descriptionHtml: productData.descriptionHtml,
            imageUrl: productData.imageUrl || "",
            price: parseFloat(String(productData.price)) || 0,
            inventory: productData.variants.reduce((sum, v) => sum + (v.inventory || 0), 0),
            readyToSync: false,

            salesTax: useCustomConfig ? SALES_TAX : undefined,
            categoryFee: useCustomConfig ? CATEGORY_FEE : undefined,
            profitMargin: useCustomConfig ? PROFIT_MARGIN : undefined,
            fixedFeeLow: useCustomConfig ? FIXED_FEE_LOW : undefined,
            fixedFeeHigh: useCustomConfig ? FIXED_FEE_HIGH : undefined,
            fixedFeeThreshold: useCustomConfig ? FIXED_FEE_THRESHOLD : undefined,

            productOptions: {
                create: productData.options.map((opt) => ({
                    name: opt.name,
                    values: opt.values,
                })),
            },
            variants: {
                create: variantCreatePayload,
            },
        },
        include: {
            variants: true,
            productOptions: true,
        },
    });

    // Optional: Suggest eBay Category
    const categorySuggest = await request({
        method: "GET",
        url: `/ebay/category/suggest?shopifyId=${product.shopifyId}`,
        headers: { Authorization: `Bearer ${token}` },
    });

    const suggestRes = categorySuggest as EbayCategorySuggestResponse;

    if (suggestRes.success && suggestRes.data.categoryId) {
        await request({
            method: "POST",
            url: `/ebay/category/save`,
            data: {
                shopifyId: productId,
                categoryId: suggestRes.data.categoryId,
                categoryName: suggestRes.data.categoryName,
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        await request({
            method: "GET",
            url: `/ebay/aspects/${suggestRes.data.categoryId}/save`,
            headers: { Authorization: `Bearer ${token}` },
        });

        await request({
            method: "POST",
            url: `/products/ai_suggestions`,
            data: {
                productId: product.id,
                categoryId: suggestRes.data.categoryId,
                data: suggestRes.data.data || [],
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        return success(product, "Product and category added", 200);
    }

    return success(product, "Product saved successfully", 201);
});

// Types
type EbayCategorySuggestResponse = {
    success: boolean;
    data: {
        categoryId?: string;
        categoryName?: string;
        data?: { categoryId: string; categoryName: string }[];
    };
};