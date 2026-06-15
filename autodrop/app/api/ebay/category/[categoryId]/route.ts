import prisma from "@/lib/prisma";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import { NextRequest, NextResponse } from "next/server";

export const GET = handlerWrapper(async (
    req: NextRequest,
    context?: { params: { [key: string]: string } }
) => {
    const params = await context?.params || {};
    const categoryId = params.categoryId;

    if (!categoryId) {
        throw createError.badRequest("Missing categoryId");
    }

    const parsedId = parseInt(categoryId);
    if (isNaN(parsedId)) {
        throw createError.badRequest("Invalid categoryId");
    }

    const category = await prisma.ebayCategory.findUnique({
        where: { categoryId: parsedId },
        include: { ebayAspects: true },
    });

    if (!category) {
        throw createError.notFound(`Category with ID ${parsedId} not found`);
    }

    return NextResponse.json(category);
});
