export const dynamic = 'force-dynamic';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { taskName, context } = await req.json();

    // ==========================================
    // MURO ANTI-ABUSO: Validación de Cuota
    // ==========================================
    // TODO: Recuperar usuario de la BD real mediante NextAuth (Ej. const user = await prisma.user.findUnique(...))
    const isMockAuthEnabled = false; 
    if (isMockAuthEnabled) {
      const userTier = "FREE";
      const userQueries = 3;
      if (userTier === "FREE" && userQueries >= 3) {
        return NextResponse.json({ 
          error: "Has alcanzado el límite de 3 matrices gratis. Haz Upgrade para continuar usando la Inteligencia Artificial.",
          requiresUpgrade: true 
        }, { status: 403 });
      }
      // TODO: Incrementar cuota al final -> prisma.user.update({ data: { queriesUsed: { increment: 1 } } })
    }
    // ==========================================

    const result = await generateObject({
      model: openai('gpt-4o-mini'),  // Usamos el modelo rápido y económico
      temperature: 0.1, // Baja temperatura para resultados jurídicos, estables y matemáticamente predecibles
      schema: z.object({
        task: z.string().describe("Nombre normalizado de la tarea"),
        risks: z.array(z.object({
          hazard: z.string().describe("El peligro identificado"),
          incident: z.string().describe("Incidente o consecuencia potencial (ej. Caída de distinto nivel)"),
          probability: z.number().describe("Probabilidad del evento (escala 1 al 5, donde 1 es Raro y 5 es Casi seguro)"),
          severity: z.number().describe("Severidad o Consecuencia (escala 1 al 5, donde 1 es Insignificante y 5 es Severo)"),
          magnitudeRisk: z.number().describe("Magnitud del Riesgo (OBLIGATORIO: Matemáticamente exacto a Probabilidad multiplicada por Severidad. Rango 1 al 25)"),
          initialRiskLevel: z.string().describe("Nivel Cualitativo. Escribe un texto descriptivo, el Frontend definirá visualmente luego basado en la Matriz."),
          controls: z.array(z.string()).describe("Lista de controles. REGLA: Cada control debe comenzar con su categoría en corchetes y seguir con la ACCIÓN ESPECÍFICA para corregir o prevenir el riesgo (ej. '[Ingeniería] Instalación de mallas anticaídas', NUNCA pongas solo 'Ingeniería')."),
        }))
      }),
      prompt: `Eres un Prevencionista de Riesgos experto bajo la normativa Chilena (Ley 16.744 y DS 594).
      Genera la Matriz MIPER (Identificación de Peligros y Evaluación de Riesgos) para esta tarea:
      Tarea: ${taskName}
      Contexto adicional: ${JSON.stringify(context)}
      
      Identifica de manera EXHAUSTIVA todos los riesgos inherentes a la maniobra. 
      REGLA N°0: OBLIGATORIAMENTE DEBES ENCONTRAR UN MÍNIMO DE 6 RIESGOS. No te limites, si hay más, decláralos todos.
      
      REGLA CRÍTICA NORMATIVA (SISTEMA INTEGRAL CHILENO): Combina obligatoriamente Riesgos de Seguridad y Riesgos de Salud Ocupacional. NO EXCLUYAS LOS RIESGOS MECÁNICOS (Ej: salpicaduras de metal fundido, cortes, caídas, proyección de partículas). Entrégales igual prioridad, pero SUMA a tu análisis los Protocolos MINSAL aplicables y el DS 594.
      1. Agentes Higiénicos / DS 594: Físicos (transmisión de calor, radiación UV/IR, ruido contínuo, vibraciones), Químicos (humos tóxicos, gases, silicosis parcial) y Biológicos (Hantavirus o picaduras en zonas rurales).
      2. Protocolos MINSAL: Especifica cumplimiento para PREXOR (Ruido), PLANESI (Sílice) o Radiación UV Solar si el trabajo es a la intemperie.
      3. Ergonomía y TMERT (Ley 20.001 - Ley del Saco): Evalúa trastornos musculoesqueléticos por movimientos repetitivos, manejo manual de cargas o posturas forzadas sostenidas.
      4. Factores Psicosociales (CEAL-SM / ISTAS 21): Si implica turnos nocturnos, trabajo en solitario o alta carga cognitiva, detállalo.
      
      REGLA CRÍTICA MATEMÁTICA EN MATRIZ 5x5: Tu respuesta cuantitativa DEBE ser perfecta en una escala de 5x5.
      - Probabilidad va de 1 a 5 (1: Raro, 2: Poco probable, 3: Moderado, 4: Probable, 5: Casi seguro).
      - Severidad va de 1 a 5 (1: Insignificante, 2: Menor, 3: Significativo, 4: Mayor, 5: Severo).
      El campo magnitudeRisk DEBE dar exactamente probability * severity (rango de 1 a 25).
      
      REGLA CRÍTICA N°5 (CONTROLES): OBLIGATORIAMENTE cada control debe comenzar con su categoría entre corchetes (Ej: [Ingeniería], [Administrativo], [EPP], [Sustitución]) SEGUIDO de la acción directa y específica para mitigarlo. Ejemplo: "[EPP] Uso de arnés de seguridad de cuerpo entero". ESTÁ ESTRICTAMENTE PROHIBIDO omitir los corchetes de la categoría y está prohibido responder solo la categoría sin la acción.

      Aterriza las consecuencias fisiológicas reales y severas según la maniobra (Por ejemplo: hipoacusia neurosensorial, silicosis, lumbago crónico por MMC, quemaduras por daño actínico UV, tendinitis bicipital, etc).`,
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
