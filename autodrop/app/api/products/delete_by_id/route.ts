import prisma from "@/lib/prisma";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";

export const DELETE = handlerWrapper(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
        return success("Product ID is required");
    }

    const productId = Number(id);

    try {
        // First get related variant IDs
        const variants = await prisma.variant.findMany({
            where: { productId },
            select: { id: true },
        });

        const variantIds = variants.map(v => v.id);

        const variantSkus = await prisma.variant.findMany({
            where: { productId },
            select: { sku: true },
        });

        const skuList = variantSkus.map(v => v.sku);

        // Delete all dependent data first
        await prisma.$transaction([
            // Delete VariantOptions linked to Variants
            prisma.variantOption.deleteMany({
                where: { variantId: { in: variantIds } },
            }),

            // Delete OrderItems linked to Variant SKUs
            prisma.orderItem.deleteMany({
                where: { sku: { in: skuList } },
            }),

            // Delete Orders linked to Product
            prisma.order.deleteMany({
                where: { productId },
            }),

            // Delete AISuggestions
            prisma.aISuggestion.deleteMany({
                where: { productId },
            }),

            // Delete ProductOptions
            prisma.productOption.deleteMany({
                where: { productId },
            }),

            // Delete EbayListing
            prisma.ebayListing.deleteMany({
                where: { productId },
            }),

            // Delete Variants
            prisma.variant.deleteMany({
                where: { productId },
            }),

            // Finally delete the Product
            prisma.product.delete({
                where: { id: productId },
            }),
        ]);

        return success({ result: "Success" }, "Product deleted successfully");
    } catch (error) {
        console.error(error);
        return success({ result: "Error" }, "Failed to delete product: " + (error as Error).message);
    }
});
