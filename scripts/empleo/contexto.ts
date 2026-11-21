/**
 * Imprime en JSON el contexto de una vacante para el agente de Claude Code.
 *   npm run empleo:contexto            -> lista tus vacantes guardadas
 *   npm run empleo:contexto -- <id>    -> HV + vacante + análisis por reglas
 */
import { getSavedJobAdmin, getSavedJobsAdmin } from "@/lib/data/jobs-queries";
import { buildAgentContext } from "@/lib/jobs/agent/context";
import { analyzeJob } from "@/lib/jobs/analysis";
import { getMasterCv } from "@/lib/jobs/master-cv";
import { assertEnv, fail } from "./shared";

async function main() {
  assertEnv();
  const id = process.argv[2];
  if (!id) {
    const jobs = await getSavedJobsAdmin();
    const list = jobs.map((j) => ({ id: j.id, titulo: j.title, empresa: j.company, estado: j.status, puntaje: j.score }));
    console.log(JSON.stringify(list, null, 2));
    return;
  }
  const [job, cv] = await Promise.all([getSavedJobAdmin(id), getMasterCv()]);
  if (!job) fail(`No existe una vacante guardada con id ${id}. Ejecuta sin id para ver la lista.`);
  console.log(JSON.stringify(buildAgentContext(job, cv, analyzeJob(job, cv)), null, 2));
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
