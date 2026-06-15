import { NextRequest, NextResponse } from 'next/server';
import { unlinkProduct } from '@/lib/server/zendrop';


export async function POST(req: NextRequest) {

    const reqData = await req.json();

    const data = await unlinkProduct(reqData.productId);
    return NextResponse.json(data);
    
}