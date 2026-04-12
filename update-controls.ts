import prisma from './src/lib/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function run() {
  console.log("Iniciando migración de controles en NeonDB...");
  const projects = await prisma.project.findMany({
    where: { name: 'Piloto' }, // Buscamos específicamente el proyecto Piloto
    include: { procedures: true }
  });

  if (!projects.length) {
    console.log("No se encontró el proyecto Piloto.");
    return;
  }

  for (const project of projects) {
    for (const proc of project.procedures) {
      if (!proc.jsonPayload) continue;

      let tasks = JSON.parse(proc.jsonPayload);
      let isUpdated = false;

      for (const t of tasks) {
        if (!t.result || !t.result.risks) continue;
        for (const risk of t.result.risks) {
          const oldControls = risk.controls;
          console.log(`Re-procesando controles para peligro: ${risk.hazard}`);
          
          try {
            const res = await generateObject({
              model: openai('gpt-4o-mini'),
              schema: z.object({
                newControls: z.array(z.string())
              }),
              prompt: `
                Reescribe la siguiente lista de controles de riesgo para adaptarla estrictamente a la nueva normativa:
                "Obligatoriamente cada control debe comenzar con su categoría entre corchetes (Ej: [Ingeniería], [Administrativo], [EPP], [Sustitución]) SEGUIDO de la acción directa y específica para mitigarlo."
                
                Peligro: ${risk.hazard}
                Incidente: ${risk.incident}
                Controles antiguos:
                ${oldControls.join("\n")}
                
                Instrucciones Críticas:
                - No omitas información, combina el tipo (entre corchetes) con la acción.
                - Si el control original decía solo "Ingeniería" u otro tipo sin acción, deduze la acción técnica de prevención en base al peligro e incidente presentados.
                - Asegura que el formato exacto sea "[Categoría] Acción clara y precisa". NUNCA respondas solo la categoría.
              `
            });
            risk.controls = res.object.newControls;
            isUpdated = true;
            console.log(` -> Actualizado a: ${risk.controls}`);
          } catch(e) {
            console.error("Error contactando a OpenAI para reemplazar", e);
          }
        }
      }

      if (isUpdated) {
        await prisma.procedure.update({
          where: { id: proc.id },
          data: { jsonPayload: JSON.stringify(tasks) }
        });
        console.log(`Procedimiento '${proc.name}' guardado en NeonDB con los nuevos controles!`);
      }
    }
  }
}
run().then(() => {
  console.log('Migración completada con éxito.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
