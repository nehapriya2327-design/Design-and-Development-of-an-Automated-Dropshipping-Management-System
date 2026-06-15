import prisma from "@/lib/prisma";
import { getEbayAccessToken } from "@/lib/server/ebayToken";
import { createError } from "@/lib/server/error";
import { handlerWrapper } from "@/lib/server/handler";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = handlerWrapper(async (
    req: NextRequest,
    context?: { params: { [key: string]: string } }
) => {
    const params = context?.params;
    const categoryId = await params && params?.categoryId;
    const parsedEbayCategoryId = parseInt(categoryId ?? "");

    if (!categoryId) {
        throw createError.badRequest("Missing categoryId");
    }

    if (isNaN(parsedEbayCategoryId)) {
        throw createError.badRequest("Invalid categoryId");
    }

    // Get Ebay Access Token
    const ebayToken = await getEbayAccessToken();

    const { data } = await axios.get(
        `https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category`,
        {
            params: { category_id: parsedEbayCategoryId },
            headers: { Authorization: `Bearer ${ebayToken}` },
        }
    );

    if (!Array.isArray(data?.aspects)) {
        throw createError.server("Invalid eBay API response");
    }

    const ebayCategory = await prisma.ebayCategory.findUnique({
        where: { categoryId: parsedEbayCategoryId },
    });
    if (!ebayCategory) {
        throw createError.notFound(`Category ${parsedEbayCategoryId} not found`);
    }

    const savedAspects = [];
    for (const aspect of data.aspects) {
        const { localizedAspectName, aspectValues, aspectConstraint } = aspect;
        const required = aspectConstraint?.aspectRequired ?? false;
        if (!required) continue;

        const aspectMode = aspectConstraint?.aspectMode || "UNKNOWN";
        type AspectValue = { localizedValue: string };
        const values = aspectMode === "SELECTION_ONLY"
            ? (aspectValues?.map((v: AspectValue) => v.localizedValue) ?? [])
            : [];

        const saved = await prisma.ebayAspect.upsert({
            where: {
                ebayCategoryId_name: {
                    ebayCategoryId: ebayCategory.id,
                    name: localizedAspectName,
                },
            },
            update: { required, aspectType: aspectMode, possibleValues: values },
            create: {
                ebayCategoryId: ebayCategory.id,
                name: localizedAspectName,
                required,
                aspectType: aspectMode,
                possibleValues: values,
            },
        });

        savedAspects.push(saved);
    }


    return NextResponse.json({
        message: "Required aspects saved successfully",
        requiredAspects: savedAspects
    });
});
