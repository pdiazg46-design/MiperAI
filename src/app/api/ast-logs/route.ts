import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { projectId, procedureName, photoData, audioData, checkedControls } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "No Project ID provided" }, { status: 400 });
    }

    const astLog = await prisma.aSTLog.create({
      data: {
        projectId,
        procedureName: procedureName || 'General',
        photoData,
        audioData,
        checkedControls: JSON.stringify(checkedControls),
      }
    });

    return NextResponse.json(astLog);
  } catch (error: any) {
    console.error("Error Guardando ASTLog:", error);
    return NextResponse.json({ error: "Fallo insertando Bitácora AST." }, { status: 500 });
  }
}
