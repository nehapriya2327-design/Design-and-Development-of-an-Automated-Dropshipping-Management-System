import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
  
    
    const id = searchParams.get("id");
    // console.log(id,'idd');
    

    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    const variant = await prisma.variant.findFirst({
      where: { formattedShopifyId: id },
      include: {
        variantOptions: true,
        product: true,
        OrderItem: {
          include: {
            EbayFeedback: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, variant });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
