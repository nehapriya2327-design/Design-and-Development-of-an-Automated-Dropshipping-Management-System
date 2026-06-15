import { NextRequest, NextResponse } from 'next/server';
import { importProduct } from '@/lib/server/zendrop';


export async function POST(req: NextRequest) {

    const reqData = await req.json();

    const data = await importProduct(reqData.productId)
    return NextResponse.json(data);
    
}