import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const BulkMatrixSchema = z.object({
  tareas: z.array(z.object({
    taskOriginalName: z.string().describe("Nombre descriptivo corto de la maniobra extraída del documento maestro. Esto servirá de título para el bloque."),
    result: z.object({
      task: z.string().describe("Descripción un poco más desarrollada de la tarea analizada."),
      risks: z.array(z.object({
        hazard: z.string().describe("El peligro detectado."),
        incident: z.string().describe("El incidente o evento indeseado posible (ej: caída a distinto nivel)."),
        probability: z.number().describe("Probabilidad del evento (escala 1 al 5, donde 1 es Raro y 5 es Casi seguro)"),
        severity: z.number().describe("Severidad o Consecuencia (escala 1 al 5, donde 1 es Insignificante y 5 es Severo)"),
        magnitudeRisk: z.number().describe("Magnitud del Riesgo (Matemáticamente exacto a Probabilidad multiplicada por Severidad. Rango 1 al 25)"),
        initialRiskLevel: z.string().describe("Nivel Cualitativo (Ej: Muy bajo, Bajo, Medio, Alto, Muy alto, Extremo)"),
        controls: z.array(z.string()).describe("Lista de controles estrictos y técnicos basados en normativa legal chilena.")
      }))
    })
  }))
});

export async function POST(req: Request) {
  try {
    const { procedimientoBase, industria } = await req.json();

    if (!procedimientoBase || procedimientoBase.trim().length === 0) {
      return NextResponse.json({ error: "Falta proporcionar el texto del procedimiento base." }, { status: 400 });
    }

    const promptText = `
    Eres un experto en prevención de riesgos operacionales (Prevencionista Chileno Senior). Sector Industrial de enfoque: ${industria || 'General'}.
    Analiza meticulosamente el siguiente "Procedimiento de Trabajo Seguro" o fragmento de contexto descriptivo:
    
    ${procedimientoBase}
    
    Tu trabajo es estructurar la Matriz MIPER del proyecto rompiendo el trabajo en múltiples maniobras GRANULARES y SECUENCIALES.
    Identifica TODAS y cada una de las maniobras o fases operativas mencionadas en ese texto, SEPARÁNDOLAS estrictamente en elementos independientes dentro del array 'tareas'. 
    
    REGLA CRÍTICA N°1: PROHIBIDO agrupar todo en 1 sola tarea general. Extrae las sub-fases.
    
    REGLA CRÍTICA N°2: EXCLUYE TOTALMENTE tareas administrativas, genéricas o preliminares. IGNORA pasos como "Realizar charla de seguridad", "Verificar EPP", "Completar AST", "Reunión de coordinación". SOLAMENTE extrae MANIOBRAS FÍSICAS OPERACIONALES DIRECTAS de ingeniería, mantenimiento, construcción o terreno (Ej: "Aislamiento de energía", "Desconexión de paneles", "Izaje de carga").
    
    REGLA CRÍTICA N°3 (SISTEMA INTEGRAL CHILENO - Análisis Multidimensional Exhaustivo): Tu análisis debe ser integral y absoluto. NO LIMITES la cantidad de riesgos; extrae y calcula TODO el abanico inherente a la tarea analizada. NO OMITAS RIESGOS DE SEGURIDAD (proyección de partículas calientes, salpicaduras, choques eléctricos, cortes, caídas). Debes combinarlos en un ecosistema exhaustivo que evalúe TANTO Seguridad Industrial COMO Salud Ocupacional (Higiene). ES OBLIGATORIO que contemples:
    1. Agentes del DS 594: Físicos (soldadura IR/UV, radiación infrarroja, transmisión de calor, polvo en suspensión, ruido continuo/impacto y vibraciones) y Químicos (humos tóxicos, vapores solventes).
    2. Protocolos MINSAL: Evalúa estipulaciones de PREXOR (Ruido), PLANESI (Sílice) o exposición a Radiación UV Solar (intemperie).
    3. Biomecánica y Ergonomía (TMERT / Ley del Saco): Evalúa trastornos musculoesqueléticos por levantamiento manual de cargas, empuje/arrastre o posturas forzadas.
    4. Riesgo Psicosocial y Biológico: Protocolo CEAL-SM / ISTAS 21 (Trabajo aislado, nocturno) y zoonosis locales (Hantavirus, garrapatas) si aplica al contexto.

    REGLA CUANTITATIVA EXTRA EN MATRIZ 5x5: OBLIGATORIAMENTE calcula la Magnitud del Riesgo como el producto matemático de probability * severity (Ambas en escala de 1 a 5). 
    - Probabilidad: 1=Raro, 2=Poco probable, 3=Moderado, 4=Probable, 5=Casi seguro.
    - Severidad: 1=Insignificante, 2=Menor, 3=Significativo, 4=Mayor, 5=Severo.

    Describe explícitamente el daño fisiológico esperado (ej. quemaduras por radiación, silicosis, hipoacusia, lumbago mecánico, trastorno ansioso, etc) para que las medidas de control sean de nivel ingenieril estricto (uso de exoesqueletos, rotación de pausas, ropa ignífuga, tapones moldeados).
    `;

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      temperature: 0.1, // Restringe la creatividad, da análisis normativos estables
      schema: BulkMatrixSchema,
      prompt: promptText,
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("AI Bulk Extract Error:", error);
    return NextResponse.json({ error: error.message || "Error al procesar el documento maestro" }, { status: 500 });
  }
}
