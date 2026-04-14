import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar propiedad
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    if (project.userId !== userId && role !== 'ADMIN') {
       return NextResponse.json({ error: "No tienes permiso para borrar este proyecto" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Error Delete Project:", error);
    return NextResponse.json({ error: "Fallo al eliminar de BDD" }, { status: 500 });
  }
}
