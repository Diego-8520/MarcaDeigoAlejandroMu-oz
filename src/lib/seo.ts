import type { Metadata } from "next";

/** Dominio canónico oficial. Vercel redirige el dominio raíz a www con 308. */
const CANONICAL_ORIGIN = "https://www.diegoalejandromunoz.com";

/**
 * Origen del sitio sin barra final. Si la variable de entorno apunta al dominio
 * raíz (sin www) se normaliza a www para que canonical, sitemap y Open Graph
 * nunca declaren una URL que responde con redirección.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return CANONICAL_ORIGIN;
  try {
    const url = new URL(raw);
    if (url.hostname === "diegoalejandromunoz.com" || url.hostname === "www.diegoalejandromunoz.com") {
      return CANONICAL_ORIGIN;
    }
    return url.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Diego Alejandro Muñoz";
export const SITE_LOCALE = "es_CO";

export const HOME_TITLE = "Diego Alejandro Muñoz | Desarrollador de software en Cali";
export const HOME_DESCRIPTION =
  "Desarrollador de software en Cali, Colombia. Creo aplicaciones web, paneles administrativos e integraciones con Next.js, React, TypeScript y Supabase.";

/** URL absoluta a partir de una ruta interna ("/proyectos"). */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  /** Ruta canónica de la página, p. ej. "/servicios". */
  path: string;
  /** Usa el título tal cual, sin la plantilla "| Diego Alejandro Muñoz". */
  absoluteTitle?: boolean;
  openGraph?: Metadata["openGraph"];
};

/**
 * Metadata de una página pública con canonical y Open Graph propios.
 * Next.js combina `openGraph` de forma superficial entre segmentos, por eso se
 * repiten aquí los campos compartidos (siteName, locale, type).
 */
export function pageMetadata({ title, description, path, absoluteTitle, openGraph }: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url: path,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      ...openGraph,
    },
    twitter: {
      card: "summary",
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

/** Páginas privadas: fuera del índice y sin seguir enlaces. */
export const NO_INDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
