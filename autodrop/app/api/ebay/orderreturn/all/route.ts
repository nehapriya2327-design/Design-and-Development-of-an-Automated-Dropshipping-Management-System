import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET() {

    const ebayReturns = await prisma.ebayReturn.findMany({
        include: {
          ebayOrder: {
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
        },
      });
    return NextResponse.json(ebayReturns);

}