import type { NormalizedJob } from "../types";
import {
  type JobSource,
  SEARCH_REVALIDATE_SECONDS,
  asString,
  fetchJson,
  formatSalaryRange,
  toIsoDate,
} from "./types";

/**
 * Adzuna: México y Brasil. Requiere ADZUNA_APP_ID y ADZUNA_APP_KEY
 * (gratis en developer.adzuna.com). La API entrega solo un fragmento de la
 * descripción.
 */

type AdzunaJob = {
  id?: string | number;
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
};

const SUPPORTED = new Set(["mx", "br"]);
const CURRENCY: Record<string, string> = { mx: "MXN", br: "BRL" };

export function mapAdzunaJob(job: AdzunaJob, country: string): NormalizedJob | null {
  const title = asString(job.title)?.replace(/<[^>]+>/g, "");
  if (!job.id || !title) return null;
  return {
    source: "adzuna",
    externalId: String(job.id),
    title,
    company: asString(job.company?.display_name),
    location: asString(job.location?.display_name),
    modality: null,
    salary: formatSalaryRange(job.salary_min, job.salary_max, CURRENCY[country] ?? ""),
    description: job.description ?? "",
    url: asString(job.redirect_url),
    publishedAt: toIsoDate(job.created),
  };
}

export const adzunaSource: JobSource = {
  id: "adzuna",
  label: "Adzuna",
  homepage: "https://www.adzuna.com",
  partialDescription: true,
  isEnabled: () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
  supports: ({ country }) => SUPPORTED.has(country),
  async search({ query, country }) {
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
    url.searchParams.set("app_id", process.env.ADZUNA_APP_ID ?? "");
    url.searchParams.set("app_key", process.env.ADZUNA_APP_KEY ?? "");
    url.searchParams.set("what", query);
    url.searchParams.set("results_per_page", "30");
    url.searchParams.set("content-type", "application/json");
    const data = await fetchJson<{ results?: AdzunaJob[] }>(url.toString(), {
      next: { revalidate: SEARCH_REVALIDATE_SECONDS },
    });
    return (data.results ?? [])
      .map((job) => mapAdzunaJob(job, country))
      .filter((job): job is NormalizedJob => Boolean(job));
  },
};
