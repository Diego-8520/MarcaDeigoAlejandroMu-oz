import type { Modality, NormalizedJob } from "../types";
import {
  type JobSource,
  SEARCH_REVALIDATE_SECONDS,
  asString,
  countryName,
  fetchJson,
  formatSalaryRange,
  toIsoDate,
} from "./types";

/**
 * Get on Board (getonbrd.com): API pública, sin key, vacantes tech y
 * digitales en LatAm, mayormente en español.
 */

type GobJob = {
  id?: string;
  attributes?: Record<string, unknown>;
  links?: { public_url?: string };
};

type GobResponse = { data?: GobJob[] };

function modalityOf(attrs: Record<string, unknown>): Modality | null {
  const modality = asString(attrs.remote_modality) ?? "";
  if (/hybrid/.test(modality)) return "hibrido";
  if (/remote/.test(modality) || attrs.remote === true) return "remoto";
  if (/no_remote|on_site|in_office/.test(modality) || attrs.remote === false) return "presencial";
  return null;
}

function companyName(attrs: Record<string, unknown>): string | null {
  const company = attrs.company as { data?: { attributes?: { name?: string } } } | undefined;
  return asString(company?.data?.attributes?.name);
}

function locationOf(attrs: Record<string, unknown>): string | null {
  const countries = Array.isArray(attrs.countries) ? attrs.countries.filter((c) => typeof c === "string") : [];
  const cities = Array.isArray(attrs.location_cities) ? attrs.location_cities : [];
  const city = cities
    .map((c) => asString((c as { name?: string })?.name ?? c))
    .filter(Boolean)
    .join(", ");
  return [city, countries.join(", ") || asString(attrs.country)].filter(Boolean).join(" · ") || null;
}

export function mapGetOnBoardJob(job: GobJob): NormalizedJob | null {
  const attrs = job.attributes ?? {};
  const title = asString(attrs.title);
  if (!job.id || !title) return null;
  const parts = [
    asString(attrs.description),
    asString(attrs.functions) && `<p>Funciones:</p>${attrs.functions}`,
    asString(attrs.desirable) && `<p>Deseable:</p>${attrs.desirable}`,
    asString(attrs.benefits) && `<p>Beneficios:</p>${attrs.benefits}`,
  ].filter(Boolean);
  return {
    source: "getonboard",
    externalId: String(job.id),
    title,
    company: companyName(attrs),
    location: locationOf(attrs),
    modality: modalityOf(attrs),
    salary: formatSalaryRange(attrs.min_salary, attrs.max_salary, "USD"),
    description: parts.join("\n"),
    url: asString(job.links?.public_url) ?? `https://www.getonbrd.com/jobs/${job.id}`,
    publishedAt: toIsoDate(attrs.published_at),
  };
}

export const getOnBoardSource: JobSource = {
  id: "getonboard",
  label: "Get on Board",
  homepage: "https://www.getonbrd.com",
  partialDescription: false,
  isEnabled: () => true,
  supports: () => true,
  async search({ query, country, remote }) {
    const url = new URL("https://www.getonbrd.com/api/v0/search/jobs");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "40");
    url.searchParams.set("page", "1");
    url.searchParams.set("expand", '["company"]');
    const data = await fetchJson<GobResponse>(url.toString(), {
      next: { revalidate: SEARCH_REVALIDATE_SECONDS },
    });
    const wanted = countryName(country).toLowerCase();
    return (data.data ?? [])
      .map(mapGetOnBoardJob)
      .filter((job): job is NormalizedJob => Boolean(job))
      .filter((job) => {
        const location = (job.location ?? "").toLowerCase();
        if (remote && job.modality === "remoto") return true;
        // Sin país informado no se descarta.
        return !location || location.includes(wanted) || location.includes("remote");
      });
  },
};
