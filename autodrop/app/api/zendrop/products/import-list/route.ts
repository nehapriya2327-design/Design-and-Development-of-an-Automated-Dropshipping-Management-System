import { NextResponse } from 'next/server';
import { fetchShopifyImports } from '@/lib/server/zendrop';


export async function GET() {

    const res = await fetchShopifyImports();

    return NextResponse.json(res);
    
}