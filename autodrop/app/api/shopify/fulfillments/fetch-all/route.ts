
import prisma from "@/lib/prisma";
import { success } from '@/lib/server/response';
import { getShopifyShipmentsGraphQL } from '@/lib/server/shopify';

export async function GET() {


    const fulfillments = await getShopifyShipmentsGraphQL();

    let shipmentData = null;

    for (const fulfillment of fulfillments) {
        const shipment = await prisma.shopifyShipment.findFirst({ where: { shopifyShipmentId: fulfillment.shopifyShipmentId } });

        if (shipment?.id) {
            await prisma.shopifyShipment.update({
                where: { id: shipment.id },
                data: {
                  status: fulfillment.status,
                  displayStatus: fulfillment.displayStatus
                }
              })
        } else {
            shipmentData = await prisma.shopifyShipment.create({
                data: {
                    ...fulfillment,
                    fulfillmentLineItems: fulfillment.fulfillmentLineItems
                        ? JSON.stringify(fulfillment.fulfillmentLineItems)
                        : undefined
                }
            });
        }


    }

    return success(shipmentData, 'Shopify fulfiments create successfully.')
}