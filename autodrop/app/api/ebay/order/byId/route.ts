import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    // console.log(id, "idd");

    const order = await prisma.ebayOrder.findUnique({
      where: { ebayOrderid: String(id) },
      include: {
        shippingAddress: true,
        orderItem: {
          include: {
            variant: {
              select: { imageUrl: true, imageAlt: true },
            },
          },
        },
        shopifyShipment: {
          select: {
            id: true,
          },
        },
        payment: true,
      },
    });
    // console.log(order, "order");

    if (!order) {
      return NextResponse.json({ message: "Order not found" });
    }

    return NextResponse.json({ sucess: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" });
  }
}
