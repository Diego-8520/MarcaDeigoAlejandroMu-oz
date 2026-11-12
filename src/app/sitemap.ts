import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/data/projects-queries";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** Fecha más reciente de una columna en filas públicas; undefined si no hay datos. */
async function latest(table: string, column: string, filter?: [string, boolean]): Promise<Date | undefined> {
  try {
    let query = createPublicClient().from(table).select(column).order(column, { ascending: false }).limit(1);
    if (filter) query = query.eq(filter[0], filter[1]);
    const { data, error } = await query;
    const value = !error && data?.[0] ? (data[0] as unknown as Record<string, string | null>)[column] : null;
    return value ? new Date(value) : undefined;
  } catch {
    return undefined;
  }
}

function newest(...dates: (Date | undefined)[]): Date | undefined {
  const valid = dates.filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()));
  return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : undefined;
}

/**
 * `lastModified` solo se declara cuando hay una fecha real en los datos.
 * Las páginas cuyo contenido vive en el código (servicios, arquitectura,
 * contacto) o en tablas sin marca de tiempo (experiencia) lo omiten: un
 * lastmod que cambia en cada petición le enseña a Google a ignorarlo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, profileUpdated, testimonialsCreated, cvCreated] = await Promise.all([
    getPublishedProjects().catch(() => []),
    latest("profiles", "updated_at"),
    latest("testimonials", "created_at", ["published", true]),
    latest("cv_documents", "created_at", ["is_visible", true]),
  ]);

  const projectsUpdated = newest(...projects.map((p) => (p.updatedAt ? new Date(p.updatedAt) : undefined)));

  const page = (path: string, lastModified?: Date): Entry => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified } : {}),
  });

  const staticRoutes: Entry[] = [
    page("/", newest(projectsUpdated, profileUpdated, testimonialsCreated)),
    page("/proyectos", projectsUpdated),
    page("/servicios"),
    page("/experiencia"),
    page("/sobre-mi", profileUpdated),
    page("/cv", cvCreated),
    page("/arquitectura"),
    page("/contacto"),
  ];

  const projectRoutes: Entry[] = projects.map((project) =>
    page(`/proyectos/${project.slug}`, project.updatedAt ? new Date(project.updatedAt) : undefined),
  );

  return [...staticRoutes, ...projectRoutes];
}
