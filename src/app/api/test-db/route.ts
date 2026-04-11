import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("TEST DB ROUTE ACCESSED. Body EMAIL:", body.email); // diagnostic log

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(body.password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Wrong pass" }, { status: 401 });
    }

    return NextResponse.json({ success: true, email: user.email, role: user.role });
  } catch (error: any) {
    console.error("Test DB error:", error);
    return NextResponse.json({ error: error?.message || "Internal error fetching DB" }, { status: 500 });
  }
}
