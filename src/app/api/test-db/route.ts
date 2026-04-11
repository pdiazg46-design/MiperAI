import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Usuario o clave incorrectos" }, { status: 404 });
    }

    const match = await bcrypt.compare(body.password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // BYPASS NEXTAUTH: Creamos el token manualmente simulando NextAuth
    const secret = (process.env.NEXTAUTH_SECRET || "miperai_secret_fallback_temporal_123_edge").trim();
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        subscriptionTier: user.subscriptionTier,
        role: user.role,
        createdAt: user.createdAt,
      },
      secret: secret,
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    });

    // Configuramos la cookie exactamente como lo hace NextAuth
    const response = NextResponse.json({ success: true, email: user.email, role: user.role });
    
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    
    // Cookie de seguridad para hosting PWA/Vercel alias
    response.cookies.set("__Secure-next-auth.session-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;

  } catch (error: any) {
    console.error("Test DB error:", error);
    return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
  }
}

