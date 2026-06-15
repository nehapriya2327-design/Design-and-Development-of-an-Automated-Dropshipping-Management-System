import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface EbayAspect {
    id: number;
    name: string;
    // Add more fields if needed
}

interface SuccessResponse {
    categoryId: number;
    name: string;
    aspects: EbayAspect[];
}

interface ErrorResponse {
    error: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { categoryId: string } }
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
    try {
        const categoryId = params.categoryId;

        if (!categoryId) {
            return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
        }

        const parsedId = parseInt(categoryId, 10);
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
        }

        const category = await prisma.ebayCategory.findUnique({
            where: { categoryId: parsedId },
            include: { ebayAspects: true },
        });

        if (!category) {
            return NextResponse.json(
                { error: `Category with ebayCategoryId ${parsedId} not found` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            categoryId: category.categoryId,
            name: category.name,
            aspects: category.ebayAspects,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
