import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { projectId, photoData, audioData, transcription, reportType } = data;

    if (!projectId) {
      return NextResponse.json({ error: 'Falta projectId para relacionar Inspección.' }, { status: 400 });
    }

    // Prevent feeding raw Base64 audio into the LLM text context
    const finalTranscription = (audioData && audioData.startsWith('data:audio')) 
       ? "[El inspector ha adjuntado una nota de voz analógica en el servidor. Evalúa predominantemente la imagen fotográfica]" 
       : (transcription || 'No hay audio');

    // Construir los mensajes para el modelo Multimodal
    const messages: any[] = [
      {
        role: "system",
        content: `Eres un prevencionista de riesgos experto (normativa minera chilena, Decreto Supremo 594, Ley 16.744).
Tu misión es auditar una fotografía tomada en terreno subida por un inspector.
El inspector dice que corresponde a la tarea: "${data.taskName || 'Desconocida'}" y al procedimiento: "${data.procedureName || 'Desconocido'}".
El inspector también pudo haber dejado un reporte verbal: "${finalTranscription}".
        
INSTRUCCIONES CRÍTICAS:
1. Evalúa si la fotografía TIENE ALGO QUE VER con una faena de construcción, minería, industria o la tarea descrita. Si la foto es un animal, comida, un meme, o totalmente irracional para una inspección de trabajo, DEBES setear "isRelevant": false y explicar en description por qué rechazas la foto.
2. Si es medianamente relevante, analiza los riesgos o el cumplimiento y llena los campos restantes.
3. Si reportType es "falta", busca desviaciones graves. Si es "cumplimiento", destaca la correcta ejecución.`
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Por favor analiza esta fotografía. Considera el audio reportado: "${finalTranscription}". Tipo de reporte exigido por el inspector: ${reportType}.` }
        ]
      }
    ];

    if (photoData && photoData.startsWith('data:image')) {
       // Support base64 image for Vercel AI SDK
       const base64Data = photoData.split(',')[1];
       messages[1].content.push({
         type: "image",
         image: base64Data
       });
    }

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        isRelevant: z.boolean().describe("Falso si la fotografía es una broma, un meme, animales, o no guarda ninguna relación lógica con un entorno industrial/laboral."),
        description: z.string().describe("Descripción en 2 líneas de lo que se ve y su veredicto (Aprobado o Rechazado). Indicar con firmeza si la foto fue rechazada por irrelevante."),
        rules: z.array(z.object({
          norm: z.string().describe("Ej: D.S. N° 594, Art. 53, o NCh 998"),
          text: z.string().describe("Resumen de la regla legal aplicada")
        })).describe("Leyes chilenas violadas o cumplidas en la foto. Vacío si es irrelevante."),
        correctiveActions: z.array(z.string()).describe("Acciones correctivas inmediatas. Vacío si es cumplimiento o irrelevante.")
      }),
      messages
    });

    const extractedData = object;
    
    if (!extractedData.isRelevant) {
       // Modificamos a modo de severa advertencia administrativa
       extractedData.description = "⚠️ RECHAZO AUTOMÁTICO: La inteligencia artificial ha determinado que la fotografía subida no corresponde a una faena industrial, construcción o entorno de trabajo aplicable. Este intento de vulneración normativa ha sido registrado.";
       extractedData.rules = [];
       extractedData.correctiveActions = ["Recibir amonestación verbal por mal uso de la plataforma de registro legal.", "Repetir fotografía en el sitio exacto de trabajo."];
    }

    // Grabación física transaccional a PostgreSQL (Neon)
    const log = await prisma.inspectionLog.create({
      data: {
        projectId,
        photoData: photoData ? "base64_reducido_via_canvas_o_s3_url" : null,
        audioData: audioData ? "url_del_audio" : null,
        transcription: transcription || "Transcripción no proveída",
        reportType: reportType || 'falta',
        extractedItems: JSON.stringify(extractedData),
      }
    });

    return NextResponse.json({ success: true, log, extractedData });

  } catch (error: any) {
    console.error('Error procesando la inspección:', error);
    return NextResponse.json({ error: `Error del servidor: ${error?.message || String(error)}` }, { status: 500 });
  }
}
