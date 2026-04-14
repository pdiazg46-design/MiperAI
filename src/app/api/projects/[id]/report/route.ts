import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const companyLogo = (session?.user as any)?.companyLogo;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        astLogs: true,
        inspections: true,
        procedures: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Preparar contenido para Word
    const children: any[] = [];

    if (companyLogo) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new ImageRun({
              data: Uint8Array.from(atob(companyLogo.replace(/^data:image\/\w+;base64,/, "")), c => c.charCodeAt(0)),
              transformation: { width: 100, height: 100 }
            })
          ]
        })
      );
    }

    // Título Principal
    children.push(
      new Paragraph({
        text: 'Reporte de Inspecciones y AST',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Proyecto: ${project.name}`,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Empresa: ${project.company || 'MiperAI Demo'} | Fecha de Generación: ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Sección AST
    children.push(
      new Paragraph({
        text: '1. Registro de Charlas AST (Análisis Seguro de Trabajo)',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    if (project.astLogs && project.astLogs.length > 0) {
      project.astLogs.forEach((ast: any, idx: number) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Charla Diaria #${idx + 1} - ${new Date(ast.createdAt).toLocaleDateString()}`, bold: true }),
            ],
            spacing: { before: 200 }
          }),
          new Paragraph({
            text: `Procedimiento asociado: ${ast.procedureName}`
          })
        );
      });
    } else {
      children.push(new Paragraph({ 
        children: [new TextRun({ text: 'No se han registrado Charlas AST en este proyecto.', italics: true })]
      }));
    }

    // Sección Hallazgos en Terreno
    children.push(
      new Paragraph({
        text: '2. Registro de Inspecciones en Terreno',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    if (project.inspections && project.inspections.length > 0) {
      project.inspections.forEach((insp: any, idx: number) => {
        let parsed: any = {};
        try { parsed = JSON.parse(insp.extractedItems || "{}"); } catch(e) {}
        
        const isFalta = insp.reportType === 'falta';
        const tipoText = isFalta ? "DESVIACIÓN CRÍTICA (FALTA)" : "CUMPLIMIENTO (FELICITACIÓN)";

        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Inspección #${idx + 1} - ${new Date(insp.createdAt).toLocaleDateString()} `, bold: true }),
              new TextRun({ text: `[${tipoText}]`, bold: true, color: isFalta ? "FF0000" : "008000" })
            ],
            spacing: { before: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Descripción / Tarea: ', bold: true }),
              new TextRun({ text: parsed.description || 'Sin detalle de tarea.' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Evidencia verbal adjunta: ', bold: true }),
              new TextRun({ text: insp.transcription || 'Sin registro oral.' })
            ]
          })
        );
      });
    } else {
      children.push(new Paragraph({ 
         children: [new TextRun({ text: 'No se han registrado inspecciones de campo.', italics: true })]
      }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=Reporte_MiperAI_${project.id}.docx`,
      }
    });

  } catch (error: any) {
    console.error('Error generando DOCX:', error);
    return NextResponse.json({ error: 'Error interno generando reporte' }, { status: 500 });
  }
}
