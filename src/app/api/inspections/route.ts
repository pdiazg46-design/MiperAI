import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { projectId, photoData, audioData, transcription, reportType } = data;

    if (!projectId) {
      return NextResponse.json({ error: 'Falta projectId para relacionar Inspección.' }, { status: 400 });
    }

    const finalDescription = transcription ? transcription : "Registro manual de " + (reportType === 'falta' ? 'desviación' : 'cumplimiento') + " para la tarea: " + (data.taskName || 'General') + ".";

    const log = await prisma.inspectionLog.create({
      data: {
        projectId,
        photoData: photoData || null,
        audioData: audioData || null,
        transcription: transcription || "Registro manual",
        reportType: reportType || 'falta',
        extractedItems: JSON.stringify({
           isRelevant: true,
           description: finalDescription,
           rules: [],
           correctiveActions: []
        })
      }
    });

    return NextResponse.json({ 
      success: true, 
      logId: log.id,
      extractedData: {
         description: finalDescription
      }
    });

  } catch (error: any) {
    console.error('Error en API Inspections:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
