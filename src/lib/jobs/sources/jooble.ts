import type { Modality, NormalizedJob } from "../types";
import { type JobSource, asString, countryName, fetchJson, toIsoDate } from "./types";

/**
 * Jooble: agregador con cobertura amplia en LatAm. Requiere JOOBLE_API_KEY
 * (gratis en jooble.org/api/about). Entrega solo un fragmento de la
 * descripción.
 */

type JoobleJob = {
  id?: string | number;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
};

function modalityOf(job: JoobleJob): Modality | null {
  const text = `${job.type ?? ""} ${job.location ?? ""} ${job.title ?? ""}`.toLowerCase();
  if (/h[ií]brid/.test(text)) return "hibrido";
  if (/remot|teletrabajo|home office/.test(text)) return "remoto";
  return null;
}

export function mapJoobleJob(job: JoobleJob): NormalizedJob | null {
  const title = asString(job.title)?.replace(/<[^>]+>/g, "");
  if (!job.id || !title) return null;
  return {
    source: "jooble",
    externalId: String(job.id),
    title,
    company: asString(job.company),
    location: asString(job.location),
    modality: modalityOf(job),
    salary: asString(job.salary),
    description: job.snippet ?? "",
    url: asString(job.link),
    publishedAt: toIsoDate(job.updated),
  };
}

export const joobleSource: JobSource = {
  id: "jooble",
  label: "Jooble",
  homepage: "https://jooble.org",
  partialDescription: true,
  isEnabled: () => Boolean(process.env.JOOBLE_API_KEY),
  supports: () => true,
  async search({ query, country, remote }) {
    const key = encodeURIComponent(process.env.JOOBLE_API_KEY ?? "");
    const data = await fetchJson<{ jobs?: JoobleJob[] }>(`https://jooble.org/api/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords: remote ? `${query} remoto` : query,
        location: countryName(country),
        page: "1",
      }),
      cache: "no-store",
    });
    return (data.jobs ?? []).map(mapJoobleJob).filter((job): job is NormalizedJob => Boolean(job));
  },
};
