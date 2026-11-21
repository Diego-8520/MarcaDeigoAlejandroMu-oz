import type { NormalizedJob } from "../types";
import { normalize } from "../analysis/normalize";
import { adzunaSource } from "./adzuna";
import { getOnBoardSource } from "./getonboard";
import { joobleSource } from "./jooble";
import { remotiveSource } from "./remotive";
import type { JobSearchParams, JobSource } from "./types";

export const JOB_SOURCES: JobSource[] = [getOnBoardSource, remotiveSource, adzunaSource, joobleSource];

export type SourceStatus = {
  id: JobSource["id"];
  label: string;
  homepage: string;
  state: "ok" | "error" | "desactivada" | "no-aplica";
  count: number;
  message?: string;
};

/** Clave para detectar la misma vacante publicada en varias fuentes. */
export function dedupeKey(job: Pick<NormalizedJob, "title" | "company">): string {
  return `${normalize(job.title).trim()}|${normalize(job.company ?? "").trim()}`;
}

export function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Map<string, NormalizedJob>();
  for (const job of jobs) {
    const key = dedupeKey(job);
    const prev = seen.get(key);
    // Se prefiere la versión con la descripción más completa.
    if (!prev || job.description.length > prev.description.length) seen.set(key, job);
  }
  return [...seen.values()];
}

/** Consulta en paralelo todas las fuentes activas; una fuente caída no rompe la búsqueda. */
export async function searchAllSources(params: JobSearchParams) {
  const statuses: SourceStatus[] = [];
  const settled = await Promise.all(
    JOB_SOURCES.map(async (source) => {
      const base = { id: source.id, label: source.label, homepage: source.homepage };
      if (!source.isEnabled()) {
        statuses.push({ ...base, state: "desactivada", count: 0, message: "Falta la API key en las variables de entorno." });
        return [];
      }
      if (!source.supports(params)) {
        statuses.push({ ...base, state: "no-aplica", count: 0 });
        return [];
      }
      try {
        const jobs = await source.search(params);
        statuses.push({ ...base, state: "ok", count: jobs.length });
        return jobs;
      } catch (error) {
        statuses.push({
          ...base,
          state: "error",
          count: 0,
          message: error instanceof Error ? error.message : "Error desconocido",
        });
        return [];
      }
    }),
  );
  const order = new Map(JOB_SOURCES.map((s, i) => [s.id, i]));
  statuses.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return { jobs: dedupeJobs(settled.flat()), statuses };
}

export function sourceInfo(id: NormalizedJob["source"]) {
  return JOB_SOURCES.find((s) => s.id === id) ?? null;
}

export { COUNTRIES, countryName, isCountryCode } from "./types";
export type { CountryCode, JobSearchParams } from "./types";
