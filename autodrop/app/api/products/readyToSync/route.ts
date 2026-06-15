// api/ebay/readyToSync/route.ts
import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

export const PUT = handlerWrapper(async (req: NextRequest) => {
    const body = await req.json();
    const updates = Array.isArray(body.updates) ? body.updates : [body];

    if (!updates.length) {
        throw createError.badRequest("Missing updates array or product data");
    }

    for (const item of updates) {
        const { productId, status } = item;

        if (!productId || typeof status !== "boolean") {
            throw createError.badRequest(
                `Missing or invalid productId/status in update: ${JSON.stringify(item)}`
            );
        }

        const shopifyGid = productId.startsWith("gid://")
            ? productId
            : `gid://shopify/Product/${productId}`;

        const existingProduct = await prisma.product.findUnique({
            where: { shopifyId: shopifyGid },
        });

        if (!existingProduct) {
            throw createError.notFound(`Product not found: ${shopifyGid}`);
        }

        try {
            await prisma.product.update({
                where: { shopifyId: shopifyGid },
                data: { readyToSync: status },
            });
        } catch (error) {
            throw createError.server(
                `Failed to update product ${shopifyGid}: ${error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    return success(null, `Successfully processed ${updates.length} update${updates.length !== 1 ? "s" : ""}`, 200);
});


/* 
🧪 Example Body (Request Payload)
{
  "productId": "1234567890",
  "status": false
}

✅ Expected Request Payload (Bulk Format)
{
    "updates": [
        { "productId": "1234567890", "status": false },
        { "productId": "gid://shopify/Product/0987654321", "status": true }
    ]
}
*/
