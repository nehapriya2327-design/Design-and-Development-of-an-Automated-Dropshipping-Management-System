import prisma from "@/lib/prisma";
import { handlerWrapper } from "@/lib/server/handler";
import { createError } from "@/lib/server/error";
import { NextRequest, NextResponse } from "next/server";

export const PUT = handlerWrapper(async (
    req: NextRequest,
    context?: { params: { [key: string]: string } }
) => {
    const body = await req.json();
    const categoryId = context?.params?.categoryId;
    const parsedId = parseInt(categoryId ?? "");
    if (!categoryId || isNaN(parsedId)) throw createError.badRequest("Invalid categoryId");

    const category = await prisma.ebayCategory.findUnique({
        where: { categoryId: parsedId },
    });

    if (!category) {
        throw createError.notFound(`Category ${parsedId} not found`);
    }

    const updatedAspects = [];

    for (const aspect of body.aspects || []) {
        const updated = await prisma.ebayAspect.update({
            where: {
                ebayCategoryId_name: {
                    ebayCategoryId: category.id,
                    name: aspect.name,
                },
            },
            data: {
                required: aspect.required,
                aspectType: aspect.aspectType,
                possibleValues: aspect.possibleValues,
            },
        });
        updatedAspects.push(updated);
    }

    return NextResponse.json({
        message: "Aspects updated",
        updatedAspects,
    });
});
