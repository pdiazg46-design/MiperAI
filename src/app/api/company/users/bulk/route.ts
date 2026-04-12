import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

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
    const { users } = await req.json(); // Array of {email, name, role}
    
    if (!users || !Array.isArray(users)) {
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const defaultPassword = await bcrypt.hash('Miper2026*', 10);
    const results = { added: 0, created: 0, errors: [] as string[] };

    for (const u of users) {
        if (!u.email) continue;
        const email = u.email.trim().toLowerCase();
        const role = ['USER', 'OPERADOR', 'SUPERVISOR', 'PREVENCIONISTA'].includes(u.role?.toUpperCase()) 
                     ? u.role.toUpperCase() 
                     : 'PREVENCIONISTA'; // Default role if missed
        
        const existing = await prisma.user.findUnique({ where: { email } });
        
        if (existing) {
            await prisma.user.update({
                where: { email },
                data: { companyId: adminUser.companyId, role, canCreateMatrices: role === 'PREVENCIONISTA', canCreateInspections: true }
            });
            results.added++;
        } else {
             await prisma.user.create({
                 data: {
                     email,
                     name: u.name || email.split('@')[0],
                     password: defaultPassword,
                     companyId: adminUser.companyId,
                     role,
                     canCreateMatrices: role === 'PREVENCIONISTA',
                     canCreateInspections: true,
                     mustChangePassword: true
                 }
             });
             results.created++;
        }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fallo al procesar lote de Excel" }, { status: 500 });
  }
}
