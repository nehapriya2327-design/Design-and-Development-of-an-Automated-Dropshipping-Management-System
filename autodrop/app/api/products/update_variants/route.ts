import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

// Allowed fields for updating a variant
const allowedFields = [
    "title",
    "sku",
    "price",
    "compareAtPrice",
    "inventory",
    "imageUrl",
    "imageAlt",
    "listedOnEbay",
    "readyToSync",
    "adjustedPrice",
    "finalPrice",
] as const;

type AllowedField = typeof allowedFields[number];

type VariantUpdate = {
    [K in AllowedField]?: string | number | boolean | null;
};

type VariantRequestBody = {
    variantId?: string;
    updates?: VariantUpdate;
    variants?: { variantId: string; updates: VariantUpdate }[];
};

type VariantUpdateInput = Prisma.VariantUpdateInput;

// --- Sanitize update fields ---
const sanitizeUpdates = (updates: VariantUpdate): VariantUpdateInput => {
    const result: VariantUpdateInput = {};

    for (const key of allowedFields) {
        if (key in updates) {
            const value = updates[key];
            (result as Record<string, unknown>)[key] =
                value === "" ? null : value;
        }
    }

    return result;
};

// --- Process single variant update ---
const processVariantUpdate = async (
    variantId: string,
    updates: VariantUpdate
) => {
    const existing = await prisma.variant.findUnique({
        where: { shopifyId: variantId },
    });

    if (!existing) {
        throw createError.notFound(`Variant with shopifyId ${variantId} not found`);
    }

    const sanitized = sanitizeUpdates(updates);

    return prisma.variant.update({
        where: { shopifyId: variantId },
        data: sanitized,
    });
};

// --- PATCH handler ---
export const PATCH = handlerWrapper(async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        throw createError.unauthorized("Missing or invalid Bearer token");
    }

    const body: VariantRequestBody = await req.json();

    if (!body.variantId && !Array.isArray(body.variants)) {
        throw createError.badRequest("Missing variantId or variants array");
    }

    if (body.variantId && body.updates) {
        const updated = await processVariantUpdate(body.variantId, body.updates);
        return success(updated, "Variant updated successfully", 200);
    }

    if (Array.isArray(body.variants)) {
        const updates = await Promise.all(
            body.variants.map((v) => processVariantUpdate(v.variantId, v.updates))
        );
        return success(updates, "Variants updated successfully", 200);
    }

    throw createError.badRequest("Invalid request structure");
});
