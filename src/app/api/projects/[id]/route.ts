import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { procedures: true }
    });
    
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    return NextResponse.json(project);
    
  } catch (error: any) {
    return NextResponse.json({ error: "Error leyendo de base de datos" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await prisma.project.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "No se pudo eliminar el proyecto." }, { status: 500 });
  }
}
