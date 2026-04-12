import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).subscriptionTier !== 'ENTERPRISE') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }});
  if (!user || !user.companyId) return NextResponse.json([], { status: 200 });

  try {
    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        canCreateMatrices: true,
        canCreateInspections: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Fallo al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).subscriptionTier !== 'ENTERPRISE') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const adminUser = await prisma.user.findUnique({ where: { id: (session.user as any).id }});
  if (!adminUser || !adminUser.companyId) {
      return NextResponse.json({ error: "Empresa no configurada." }, { status: 400 });
  }

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email es requerido" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
        return NextResponse.json({ error: "Este correo aún no está registrado en MiperAI. Dile al operario que cree su cuenta gratuita primero." }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { companyId: adminUser.companyId, role: "PREVENCIONISTA" }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Fallo al vincular operario" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).subscriptionTier !== 'ENTERPRISE') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const adminUser = await prisma.user.findUnique({ where: { id: (session.user as any).id }});

  try {
    const { userId, role, canCreateMatrices, canCreateInspections } = await req.json();
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.companyId !== adminUser?.companyId) {
        return NextResponse.json({ error: "Pertenece a otra empresa o no encontrado." }, { status: 403 });
    }

    const dataToUpdate: any = {};
    if (role !== undefined) dataToUpdate.role = role;
    if (canCreateMatrices !== undefined) dataToUpdate.canCreateMatrices = canCreateMatrices;
    if (canCreateInspections !== undefined) dataToUpdate.canCreateInspections = canCreateInspections;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, role: true, canCreateMatrices: true, canCreateInspections: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Fallo actualizando permisos" }, { status: 500 });
  }
}
