import type { NormalizedJob } from "../types";
import { type JobSource, SEARCH_REVALIDATE_SECONDS, asString, countryName, fetchJson, toIsoDate } from "./types";

/**
 * Remotive: empleos 100 % remotos. API pública sin key; pide pocas consultas
 * al día (se cachea 6 h) y enlazar a la oferta original en Remotive.
 */

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
  publication_date?: string;
};

const LATAM_RE = /worldwide|anywhere|latam|latin america|americas|south america|south & central america|global/i;

export function mapRemotiveJob(job: RemotiveJob): NormalizedJob | null {
  const title = asString(job.title);
  if (!job.id || !title) return null;
  return {
    source: "remotive",
    externalId: String(job.id),
    title,
    company: asString(job.company_name),
    location: asString(job.candidate_required_location),
    modality: "remoto",
    salary: asString(job.salary),
    description: job.description ?? "",
    url: asString(job.url),
    publishedAt: toIsoDate(job.publication_date),
  };
}

export const remotiveSource: JobSource = {
  id: "remotive",
  label: "Remotive",
  homepage: "https://remotive.com",
  partialDescription: false,
  isEnabled: () => true,
  supports: ({ remote }) => remote,
  async search({ query, country }) {
    const url = new URL("https://remotive.com/api/remote-jobs");
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "50");
    const data = await fetchJson<{ jobs?: RemotiveJob[] }>(url.toString(), {
      next: { revalidate: SEARCH_REVALIDATE_SECONDS },
    });
    const wanted = countryName(country).toLowerCase();
    return (data.jobs ?? [])
      .map(mapRemotiveJob)
      .filter((job): job is NormalizedJob => Boolean(job))
      .filter((job) => {
        const location = job.location ?? "";
        return !location || LATAM_RE.test(location) || location.toLowerCase().includes(wanted);
      });
  },
};
