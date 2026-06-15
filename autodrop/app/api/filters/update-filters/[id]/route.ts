// file: /api/filters/update-filter/[id]/route.ts

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// adjust import path as needed

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { config, type } = body;

    if (!id || !config || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedFilter = await prisma.filter.update({
      where: {
        id: Number(id),
      },
      data: {
        config,

        type,
      },
    });

    return NextResponse.json({ success: true, updatedFilter });
  } catch (error) {
    console.error("Update Filter Error:", error);
    return NextResponse.json(
      { error: "Failed to update filter" },
      { status: 500 }
    );
  }
}
