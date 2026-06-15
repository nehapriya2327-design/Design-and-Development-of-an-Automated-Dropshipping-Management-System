import prisma from "@/lib/prisma";
import { success } from "@/lib/server/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, config, userId } = body;
    if ( !type || !config || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const filters = await prisma.filter.create({
      data: {
        type,   
        config,
        userId,
      },
    });
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
