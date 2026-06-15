import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET() {

    const fulfillments = await prisma.ebayShipment.findMany({ include: { order: {
        include: {
          orderItem: {
            include: {
              variant: {
                include: {
                  product: true, 
                },
              },
            },
          },
        },
    } } });
    return NextResponse.json(fulfillments);

}