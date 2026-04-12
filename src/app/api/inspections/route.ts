import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { projectId, photoData, audioData, transcription, reportType } = data;

    if (!projectId) {
      return NextResponse.json({ error: 'Falta projectId para relacionar Inspección.' }, { status: 400 });
    }

    // "Dummy" de la IA para presentar a BHP, pero permitiendo guardado real en base de datos.
    // Futuro: Aquí se conecta el fetch a OpenAI gpt-4-vision-preview
    const extractedData = {
      description: reportType === 'falta' 
        ? "Trabajo en andamio a altura sin línea de vida asegurada y plataforma incompleta (falta rodapié)."
        : "Uso ejemplar de Elementos de Protección Personal (EPP). Arnés enganchado a línea de vida y andamio estructural completamente normado con rodapiés vigentes.",
      rules: reportType === 'falta'
        ? [
            { norm: 'D.S. N° 594, Art. 53', text: 'Todo trabajador que labore a alturas mayores de 1.8 metros deberá usar cinturón de seguridad o arnés...' },
            { norm: 'NCh 998, Of.1999', text: 'Los andamios deben contar con barandas protectoras y rodapiés en todos los costados expuestos...' }
          ]
        : [
            { norm: 'D.S. N° 594, Art. 53', text: 'Cumple a cabalidad normativa de protección contra caídas en altura.' }
          ],
      correctiveActions: reportType === 'falta'
        ? [
            'Detener las faenas en andamio nivel 2 de inmediato.',
            'Proveer y obligar el enganche continuo de arnés.',
            'Instalar rodapié lateral en plataforma antes de retomar.'
          ]
        : []
    };

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

  } catch (error) {
    console.error('Error procesando la inspección:', error);
    return NextResponse.json({ error: 'Error del servidor al procesar la inspección.' }, { status: 500 });
  }
}
