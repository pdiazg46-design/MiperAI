import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { newPassword } = await req.json();
    
    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { 
          password: hashedPassword,
          mustChangePassword: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cambiando password:", error);
    return NextResponse.json({ error: "Fallo al actualizar la contraseña" }, { status: 500 });
  }
}
