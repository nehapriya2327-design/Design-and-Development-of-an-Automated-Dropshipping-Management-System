
import { getUserFromRequest } from '@/lib/server/getUser';
import { getShopifyProductsGraphQL } from '@/lib/server/shopify';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const user = getUserFromRequest(req);

    // for now, you could just log it or use user.id for product ownership later
    console.log('Internal user request from:', user.email);

    const products = await getShopifyProductsGraphQL();
    return NextResponse.json(products);
}
