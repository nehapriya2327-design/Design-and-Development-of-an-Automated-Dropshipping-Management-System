import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingProducts, fetchCategoriess } from '@/lib/server/zendrop';
import prisma from "@/lib/prisma";



export async function GET(request: NextRequest) {

    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';

    const category = await prisma.zendropCategory.findFirst();

    if(!category){
        await fetchCategoriess();
    }

    const res = await fetchTrendingProducts(page);

    return NextResponse.json(res);
    
}