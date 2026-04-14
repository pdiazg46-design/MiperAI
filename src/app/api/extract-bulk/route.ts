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
        controls: z.array(z.string()).describe("Lista de controles. REGLA: Cada control debe comenzar con su categoría en corchetes y seguir con la ACCIÓN ESPECÍFICA para corregir o prevenir el riesgo (ej. '[Ingeniería] Instalación de mallas anticaídas', NUNCA pongas solo 'Ingeniería').")
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
    
    REGLA CRÍTICA N°0 (GRANULARIDAD OBLIGATORIA): ES OBLIGATORIO QUE FRAGMENTES EL DOCUMENTO EN UN MÍNIMO DE 5 TAREAS/MANIOBRAS DISTINTAS. ¡Bajo ninguna circunstancia puedes resumir todo el documento en 1 sola tarea general! Si el procedimiento es corto, divídelo en sus pasos lógicos más pequeños (ej: 1. Preparación área, 2. Traslado de materiales, 3. Maniobra principal fase 1, 4. Maniobra fase 2, 5. Desarme o limpieza).

    REGLA CRÍTICA N°1: PROHIBIDO agrupar todo en 1 sola tarea general. Extrae las sub-fases operativas en múltiples tareas. Cada tarea debe representar un paso secuencial distinto en la ejecución real en terreno.
    
    REGLA CRÍTICA N°2: EXCLUYE TOTALMENTE tareas administrativas, genéricas o preliminares. IGNORA pasos como "Realizar charla de seguridad", "Verificar EPP", "Completar AST", "Reunión de coordinación". SOLAMENTE extrae MANIOBRAS FÍSICAS OPERACIONALES DIRECTAS.
    
    REGLA CRÍTICA N°3 (PROFUNDIDAD OBLIGATORIA): ¡PROHIBIDO DEJAR UNA TAREA CON 1 SOLO RIESGO! Genera la matriz expandida como un prevencionista Senior. OBLIGATORIAMENTE DEBES ENCONTRAR UN MÍNIMO DE 4 RIESGOS Y HASTA 7 RIESGOS POR CADA SUB-FASE O TAREA.
    
    REGLA CRÍTICA N°4 (SISTEMA INTEGRAL CHILENO - Análisis Multidimensional Exhaustivo): Tu análisis debe ser absoluto por cada tarea. Combina Riesgos Mecánicos (salpicaduras, choques eléctricos, cortes, caídas, atrapamientos) y Riesgos de Salud Ocupacional (Higiene). ES OBLIGATORIO que sumes estos al abanico de riesgos de cada tarea:
    1. Agentes del DS 594: Físicos (transmisión de calor, radiación UV/IR, ruido contínuo y vibraciones), Químicos (humos, solventes, polvos en suspensión como la sílice).
    2. Protocolos MINSAL: PREXOR (Ruido), PLANESI (Sílice) o Radiación UV Solar (intemperie).
    3. Ergonomía y TMERT (Ley 20.001 - Ley del Saco): Evalúa trastornos musculoesqueléticos por levantamiento manual de cargas, empuje/arrastre o posturas forzadas.
    4. Riesgo Psicosocial y Biológico: Trabajo solitario/nocturno, o zoonosis locales (Hantavirus, insectos) si aplica al contexto ambiental.

    REGLA CUANTITATIVA EXTRA EN MATRIZ 5x5: OBLIGATORIAMENTE calcula la Magnitud del Riesgo como el producto matemático de probability * severity (Ambas en escala de 1 a 5). 
    - Probabilidad: 1=Raro, 2=Poco probable, 3=Moderado, 4=Probable, 5=Casi seguro.
    - Severidad: 1=Insignificante, 2=Menor, 3=Significativo, 4=Mayor, 5=Severo.

    REGLA CRÍTICA N°5 (CONTROLES): OBLIGATORIAMENTE cada control debe comenzar con su categoría entre corchetes (Ej: [Ingeniería], [Administrativo], [EPP], [Sustitución]) SEGUIDO de la acción directa y específica para mitigarlo. Ejemplo: "[EPP] Uso de arnés de seguridad de cuerpo entero". ESTÁ ESTRICTAMENTE PROHIBIDO omitir los corchetes de la categoría y está prohibido responder solo la categoría sin la acción.

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
