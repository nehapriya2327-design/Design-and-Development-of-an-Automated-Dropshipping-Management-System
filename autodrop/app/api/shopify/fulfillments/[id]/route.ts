
import { getShopifyShipmentGraphQL } from '@/lib/server/shopify';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { success } from '@/lib/server/response';



export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Missing Order ID' }, { status: 400 });
    }

    const fulfillment = await prisma.shopifyShipment.findFirst({ where: { id: parseInt(id)}});

    

    return NextResponse.json(fulfillment);
}



export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
    const { orderId } = await params;
    if (!orderId) {
        return NextResponse.json({ error: 'Missing Order ID' }, { status: 400 });
    }

    const fulfillments = await getShopifyShipmentGraphQL(orderId);

    let shipmentData = null;

    for(const fulfillment of fulfillments){
        const shipment = await prisma.shopifyShipment.findFirst({ where: { orderId: parseInt(orderId), shopifyShipmentId:fulfillment.shopifyShipmentId}});

        if(shipment?.id){
            continue;
        }else{
            shipmentData = await prisma.shopifyShipment.create({data:{...fulfillment,
                fulfillmentLineItems: fulfillment.fulfillmentLineItems
                  ? JSON.stringify(fulfillment.fulfillmentLineItems)
                  : undefined,}});
        }


    }

    return success(shipmentData, 'Shopify fulfiments create successfully.')
}