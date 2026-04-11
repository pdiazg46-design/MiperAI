import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { projectName, procedureName, tasksPayload, companyName } = await req.json();

    // Creamos ambas cosas en una sola transacción anidada
    const project = await prisma.project.create({
      data: {
        name: projectName || 'Nuevo Proyecto Seguro',
        company: companyName || 'ACME Corp',
        userId: userId || null,
        procedures: {
          create: {
            name: procedureName || 'Procedimiento Base',
            jsonPayload: JSON.stringify(tasksPayload),
          }
        }
      },
      include: {
        procedures: true
      }
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error Guardando Proyecto:", error);
    return NextResponse.json({ error: "Fallo estructural en BDD." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        procedures: true
      }
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Error Obteniendo Historial:", error);
    return NextResponse.json({ error: "Error de lectura DB." }, { status: 500 });
  }
}
