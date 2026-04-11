import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
