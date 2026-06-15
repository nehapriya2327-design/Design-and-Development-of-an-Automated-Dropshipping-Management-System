import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET() {

    const fulfillments = await prisma.shopifyShipment.findMany({ 
        include: { 
            order: {
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
            }, 
            ebayShipment: true 
        } 
    });
    return NextResponse.json(fulfillments);

}