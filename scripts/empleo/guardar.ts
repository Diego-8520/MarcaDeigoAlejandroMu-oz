/**
 * Valida y guarda un resultado del agente.
 *   npm run empleo:guardar -- <id> <hv|evaluacion> <archivo.json>
 * Si la validación falla (p. ej. una cifra o skill inventada), no guarda nada
 * e imprime los errores para corregirlos.
 */
import { readFile } from "node:fs/promises";
import { getSavedJobAdmin } from "@/lib/data/jobs-queries";
import { AGENT_OUTPUT_KINDS, type AgentOutputKind } from "@/lib/jobs/agent/schemas";
import { validateAgentOutput } from "@/lib/jobs/agent/validate";
import { analyzeJob } from "@/lib/jobs/analysis";
import { getMasterCv } from "@/lib/jobs/master-cv";
import { storeAgentOutput } from "@/lib/jobs/store";
import { assertEnv, fail } from "./shared";

async function main() {
  assertEnv();
  const [id, kind, file] = process.argv.slice(2);
  if (!id || !kind || !file) fail("Uso: npm run empleo:guardar -- <id> <hv|evaluacion> <archivo.json>");
  if (!AGENT_OUTPUT_KINDS.includes(kind as AgentOutputKind)) fail(`Tipo inválido "${kind}". Usa hv o evaluacion.`);

  let content: unknown;
  try {
    content = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    fail(`No se pudo leer ${file} como JSON: ${error instanceof Error ? error.message : error}`);
  }

  const [job, cv] = await Promise.all([getSavedJobAdmin(id), getMasterCv()]);
  if (!job) fail(`No existe una vacante guardada con id ${id}.`);

  const result = validateAgentOutput(kind as AgentOutputKind, content, cv, analyzeJob(job, cv));
  if (!result.ok) {
    console.error("✗ No se guardó. Corrige estos puntos:");
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  for (const warning of result.warnings) console.warn(`! ${warning}`);
  await storeAgentOutput(id, kind as AgentOutputKind, result.data, cv);
  const path = kind === "hv" ? `/dashboard/empleo/${id}/hv` : `/dashboard/empleo/${id}`;
  console.log(`✓ Guardado. Míralo en ${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${path}`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
