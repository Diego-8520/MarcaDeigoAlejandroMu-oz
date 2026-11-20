import { createHash } from "node:crypto";
import { assertPublicUrl } from "@/lib/screenshots/url-guard";
import { extractModality } from "../analysis/extract";
import { htmlToText, normalize } from "../analysis/normalize";
import type { NormalizedJob } from "../types";

/**
 * Vacantes pegadas a mano: texto libre o URL. Para URLs se intenta leer el
 * JSON-LD `JobPosting` (schema.org) que publican muchos portales; si no, se
 * toma el texto de la página. Sitios con login (LinkedIn) suelen bloquear la
 * lectura: en ese caso se pide pegar el texto.
 */

const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;

export class ManualJobError extends Error {}

type ParsedPage = {
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
};

function first<T>(value: T | T[] | undefined | null): T | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

function findJobPosting(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const record = node as Record<string, unknown>;
  const type = record["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return record;
  return findJobPosting(record["@graph"]);
}

/** Extrae datos de la vacante desde el HTML de una página. */
export function parseJobPage(html: string): ParsedPage {
  for (const match of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const posting = findJobPosting(JSON.parse(match[1].trim()));
      if (!posting) continue;
      const org = first(posting.hiringOrganization as Record<string, unknown> | Record<string, unknown>[]);
      const place = first(posting.jobLocation as Record<string, unknown> | Record<string, unknown>[]);
      const address = (place?.address ?? {}) as Record<string, unknown>;
      const location = [address.addressLocality, address.addressRegion, address.addressCountry]
        .map((v) => (typeof v === "string" ? v : (v as { name?: string } | undefined)?.name))
        .filter(Boolean)
        .join(", ");
      return {
        title: typeof posting.title === "string" ? posting.title : null,
        company: typeof org?.name === "string" ? org.name : null,
        location: location || (posting.jobLocationType === "TELECOMMUTE" ? "Remoto" : null),
        description: typeof posting.description === "string" ? htmlToText(posting.description) : null,
      };
    } catch {
      // JSON-LD inválido: se prueba el siguiente bloque.
    }
  }
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  return {
    title: htmlToText(og ?? titleTag ?? "").trim() || null,
    company: null,
    location: null,
    description: htmlToText(main.replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, " ")),
  };
}

async function fetchHtml(rawUrl: string): Promise<string> {
  let url = (await assertPublicUrl(rawUrl)).toString();
  for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BuscadorEmpleo/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es,en;q=0.8",
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      // Cada redirección se valida de nuevo (anti-SSRF).
      url = (await assertPublicUrl(new URL(location, url).toString())).toString();
      continue;
    }
    if (!response.ok) {
      throw new ManualJobError(
        `La página respondió ${response.status}. Si requiere iniciar sesión (p. ej. LinkedIn), copia y pega el texto de la vacante.`,
      );
    }
    const reader = response.body?.getReader();
    if (!reader) return "";
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.byteLength;
    }
    await reader.cancel().catch(() => {});
    return new TextDecoder().decode(Buffer.concat(chunks));
  }
  throw new ManualJobError("Demasiadas redirecciones.");
}

export type ManualJobInput = {
  url?: string | null;
  text?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
};

/** Convierte lo que pegaste (texto y/o URL) en una vacante normalizada. */
export async function buildManualJob(input: ManualJobInput): Promise<NormalizedJob> {
  const text = input.text?.trim() ?? "";
  const url = input.url?.trim() || null;
  let page: ParsedPage = { title: null, company: null, location: null, description: null };

  if (url && text.length < 200) {
    try {
      page = parseJobPage(await fetchHtml(url));
    } catch (error) {
      if (!text) {
        throw error instanceof ManualJobError
          ? error
          : new ManualJobError("No se pudo leer la URL. Copia y pega el texto de la vacante.");
      }
    }
  }

  const description = text || page.description || "";
  if (normalize(description).trim().split(" ").length < 15) {
    throw new ManualJobError(
      "No hay suficiente texto para analizar. Pega la descripción completa de la vacante (requisitos y funciones).",
    );
  }

  const firstLine = description.split("\n").find((l) => l.trim())?.trim() ?? "";
  const title = input.title?.trim() || page.title || (firstLine.length <= 90 ? firstLine : "Vacante sin título");

  return {
    source: "manual",
    externalId: url ?? createHash("sha1").update(description).digest("hex").slice(0, 16),
    title: title.slice(0, 200),
    company: input.company?.trim() || page.company || null,
    location: input.location?.trim() || page.location || null,
    modality: extractModality(normalize(description)),
    salary: null,
    description,
    url,
    publishedAt: null,
  };
}
