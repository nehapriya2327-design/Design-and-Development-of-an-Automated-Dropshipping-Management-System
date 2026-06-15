import { NextRequest, NextResponse } from 'next/server';
import { fetchProductDetail } from '@/lib/server/zendrop';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

    const { id } = await params;

    const res = await fetchProductDetail(id);

    return NextResponse.json(res);
    
}