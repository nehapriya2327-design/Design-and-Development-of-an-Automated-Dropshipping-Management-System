
import { getProductByIdGraphQL } from '@/lib/server/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }
    const productId = Array.isArray(id) ? id[0] : id;
    const products = await getProductByIdGraphQL(productId);
    return NextResponse.json(products);
}
