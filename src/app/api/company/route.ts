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

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json(user.company);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).subscriptionTier !== 'ENTERPRISE') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (!user) return NextResponse.json({ error: "Usuario no existe" }, { status: 404 });

    if (!user.companyId) {
       // Auto-generación de registro de compañía
       const newCompany = await prisma.company.create({
         data: {
           name: user?.name ? `Empresa de ${user.name}` : "Mi Empresa Corporativa",
           subscriptionTier: "ENTERPRISE",
         }
       });
       await prisma.user.update({
         where: { id: user?.id },
         data: { companyId: newCompany.id }
       });
       user.companyId = newCompany.id;
    }

    const updates = await req.json();
    const allowedKeys = ['name', 'rut', 'logo', 'address', 'adminContactName', 'adminContactEmail', 'adminContactPhone'];
    const dataToUpdate: any = {};
    for (const key of allowedKeys) {
        if (updates[key] !== undefined) {
             dataToUpdate[key] = updates[key];
        }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fallo al actualizar el perfil corporativo" }, { status: 500 });
  }
}
