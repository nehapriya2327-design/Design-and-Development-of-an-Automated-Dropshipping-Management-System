export interface Variant {
    id: number;
    productId: number;
    shopifyId: string;
    formattedShopifyId: string;
    title: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    inventory: number;
    imageUrl: string | null;
    imageAlt: string | null;
    listedOnEbay: boolean;
    readyToSync: boolean;

    // eBay pricing and fee fields
    salesTax: number | null;
    categoryFee: number | null;
    fixedFee: number | null;
    adjustedPrice: number | null;
    profitMargin: number | null;
    finalPrice: number | null;
}

export interface Product {
    id: number;
    title: string;
    imageUrl: string;
    categoryId?: number;
    category?: {
        id: number;
        categoryId: number;
        name: string;
    };
    shopifyId: string;
    formattedShopifyId: string;
    salesLast7Days?: number;
    issueDescription?: string;
    readyToSync: boolean;
    variants: Variant[];

    // New optional config fields
    usesCustomConfig?: boolean;
    salesTax?: number;
    categoryFee?: number;
    profitMargin?: number;
    fixedFeeLow?: number;
    fixedFeeHigh?: number;
    fixedFeeThreshold?: number;
}
