import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

export const PATCH = handlerWrapper(async (req: NextRequest) => {
    const { categoryId, name } = await req.json();

    if (!categoryId || !name) {
        throw createError.badRequest("categoryId and name are required");
    }

    const updated = await prisma.ebayCategory.update({
        where: { categoryId: parseInt(categoryId) },
        data: { name: name.trim() },
    });

    return success(updated, "Category updated");
});
