import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { company: true } });
    if (!user?.company?.logo) {
      return NextResponse.json({ logo: null });
    }

    return NextResponse.json({ logo: user.company.logo });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { base64 } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true, role: true } });
    
    if (!user?.companyId) {
      return NextResponse.json({ error: "No tienes una cuenta B2B corporativa vinculada por un Administrador." }, { status: 403 });
    }

    // Permitir a cargos altos cambiar el logo B2B de su organización
    if (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR' && user.role !== 'PREVENCIONISTA') {
      return NextResponse.json({ error: "Tu rol no permite cambiar el logo de la organización." }, { status: 403 });
    }

    await prisma.company.update({
      where: { id: user.companyId },
      data: { logo: base64 }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
