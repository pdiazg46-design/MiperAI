import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        queriesUsed: true,
        createdAt: true,
        company: {
          select: { name: true }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Fallo al obtener usuarios" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { userId, newTier, newRole, newCompany } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (newTier) dataToUpdate.subscriptionTier = newTier;
    if (newRole) dataToUpdate.role = newRole;

    if (newCompany !== undefined) {
      if (newCompany === null || newCompany.trim() === '') {
        dataToUpdate.companyId = null;
      } else {
        let company = await prisma.company.findFirst({ where: { name: newCompany.trim() } });
        if (!company) {
          company = await prisma.company.create({ data: { name: newCompany.trim() } });
        }
        dataToUpdate.companyId = company.id;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, subscriptionTier: true, role: true, company: { select: { name: true } } }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fallo al actualizar el plan u operario B2B" }, { status: 500 });
  }
}
