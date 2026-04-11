import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos (email o password)." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El correo ya está registrado." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isSuperAdmin = email.toLowerCase() === "pdiazg46@gmail.com";

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        subscriptionTier: isSuperAdmin ? "ENTERPRISE" : "FREE",
        role: isSuperAdmin ? "ADMIN" : "USER"
      },
    });

    return NextResponse.json({ message: "Usuario creado con éxito." }, { status: 201 });
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
