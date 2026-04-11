import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);

// Evitar múltiples instancias en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { projectName, procedureName, tasksPayload, companyName } = await req.json();

    // Creamos ambas cosas en una sola transacción anidada
    const project = await prisma.project.create({
      data: {
        name: projectName || 'Nuevo Proyecto Seguro',
        company: companyName || 'ACME Corp',
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
    const projects = await prisma.project.findMany({
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
