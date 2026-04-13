import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { projectId, projectName, procedureName, tasksPayload, companyName } = await req.json();

    if (projectId) {
      // Intentar actualizar el proyecto existente
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: { procedures: true }
      });

      if (existingProject) {
        const procId = existingProject.procedures[0]?.id;
        
        await prisma.project.update({
          where: { id: projectId },
          data: {
            name: projectName || 'Nuevo Proyecto Seguro',
            company: companyName || existingProject.company,
          }
        });
        
        if (procId) {
          await prisma.procedure.update({
            where: { id: procId },
            data: {
              name: procedureName || 'Procedimiento Base',
              jsonPayload: JSON.stringify(tasksPayload),
            }
          });
        }
        return NextResponse.json({ success: true, updated: true, id: projectId });
      }
    }

    // Creamos ambas cosas en una sola transacción anidada si es un proyecto nuevo
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
        procedures: true,
        astLogs: { orderBy: { createdAt: 'desc' } },
        inspections: { orderBy: { createdAt: 'desc' } }
      }
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Error Obteniendo Historial:", error);
    return NextResponse.json({ error: "Error de lectura DB." }, { status: 500 });
  }
}
