
import { success } from '@/lib/server/response';
import { createShopifyReturnGraphQL } from '@/lib/server/shopify';

export async function GET() {

    const orderReturns = await createShopifyReturnGraphQL();
    return success(orderReturns, 'Shopify return create successfully.')
}