import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userId = 1;
    if (!type || !userId) {
      return NextResponse.json(
        { error: "Missing type or userId" },
        { status: 400 }
      );
    }
    const filters = await prisma.filter.findMany({
      where: { type: type },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
