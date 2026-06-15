// /app/api/products/all/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                variants: true, // assuming your schema has a relation defined
                category: true, // include category if needed
            },
        });

        return NextResponse.json(
            {
                result: "SUCCESS",
                message: "Products fetched successfully",
                data: products,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            {
                result: "ERROR",
                message: "Failed to fetch products",
            },
            { status: 500 }
        );
    }
}
