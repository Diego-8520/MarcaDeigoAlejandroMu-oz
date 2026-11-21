import type { JobSourceId, NormalizedJob } from "../types";

export const COUNTRIES = [
  { code: "co", name: "Colombia" },
  { code: "mx", name: "México" },
  { code: "ar", name: "Argentina" },
  { code: "cl", name: "Chile" },
  { code: "pe", name: "Perú" },
  { code: "ec", name: "Ecuador" },
  { code: "uy", name: "Uruguay" },
  { code: "br", name: "Brasil" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export function countryName(code: CountryCode): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export function isCountryCode(value: unknown): value is CountryCode {
  return COUNTRIES.some((c) => c.code === value);
}

export type JobSearchParams = {
  query: string;
  country: CountryCode;
  /** Incluir vacantes remotas para LatAm. */
  remote: boolean;
};

export type JobSource = {
  id: Exclude<JobSourceId, "manual">;
  label: string;
  /** URL pública de la fuente (atribución). */
  homepage: string;
  /** La descripción que entrega la API es solo un fragmento. */
  partialDescription: boolean;
  isEnabled(): boolean;
  /** ¿Tiene sentido consultar esta fuente con estos parámetros? */
  supports(params: JobSearchParams): boolean;
  search(params: JobSearchParams): Promise<NormalizedJob[]>;
};

/** Las APIs públicas se cachean 6 h (Remotive pide pocas consultas al día). */
export const SEARCH_REVALIDATE_SECONDS = 60 * 60 * 6;
export const SEARCH_TIMEOUT_MS = 10_000;

export async function fetchJson<T>(url: string, init: RequestInit & { next?: { revalidate?: number } } = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

export function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

export function toIsoDate(value: unknown): string | null {
  if (typeof value === "number") return new Date(value * (value < 1e12 ? 1000 : 1)).toISOString();
  if (typeof value === "string" && value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export function formatSalaryRange(min: unknown, max: unknown, currency = ""): string | null {
  const fmt = (v: unknown) =>
    typeof v === "number" && v > 0 ? new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(v) : null;
  const a = fmt(min);
  const b = fmt(max);
  if (!a && !b) return null;
  const range = a && b && a !== b ? `${a} - ${b}` : (a ?? b);
  return `${range}${currency ? ` ${currency}` : ""}`;
}
