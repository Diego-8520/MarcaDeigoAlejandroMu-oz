import type { Project } from "@/types/project";
import { CONTACT } from "@/lib/site";
import { HOME_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * Datos estructurados (Schema.org, JSON-LD). Solo usan información que ya se
 * publica en el sitio; nada de valoraciones, precios ni credenciales nuevas.
 * Los nodos se enlazan por `@id` dentro del `@graph` de cada página.
 */

type Node = Record<string, unknown>;

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Persona completa: home y /sobre-mi. */
export function personNode(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Diego Alejandro Muñoz Arcos",
    alternateName: ["Diego Alejandro Muñoz", "Diego Muñoz"],
    jobTitle: "Desarrollador de software",
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    email: `mailto:${CONTACT.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cali",
      addressRegion: "Valle del Cauca",
      addressCountry: "CO",
    },
    sameAs: [CONTACT.github, CONTACT.linkedin],
    knowsAbout: ["Desarrollo web", "Next.js", "React", "TypeScript", "PostgreSQL", "Supabase", "Automatización de procesos"],
  };
}

/** Referencia mínima a la persona para páginas que no repiten el nodo completo. */
export function personRef(): Node {
  return { "@type": "Person", "@id": PERSON_ID, name: SITE_NAME, url: SITE_URL };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "es-CO",
    publisher: { "@id": PERSON_ID },
  };
}

/** Página de perfil (home y /sobre-mi) cuyo tema principal es la persona. */
export function profilePageNode(path: string, name: string, dateModified?: string): Node {
  return {
    "@type": "ProfilePage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    inLanguage: "es-CO",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    ...(dateModified ? { dateModified } : {}),
  };
}

export type Crumb = { name: string; path: string };

/** Migas: siempre empiezan en Inicio. */
export function breadcrumbNode(crumbs: Crumb[]): Node {
  const items = [{ name: "Inicio", path: "/" }, ...crumbs];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export type ServiceInput = { slug: string; name: string; summary: string };

export function serviceNodes(services: ServiceInput[]): Node[] {
  return services.map((s) => ({
    "@type": "Service",
    "@id": `${absoluteUrl("/servicios")}#${s.slug}`,
    name: s.name,
    serviceType: s.name,
    description: s.summary,
    url: `${absoluteUrl("/servicios")}#${s.slug}`,
    provider: { "@id": PERSON_ID },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/contacto"),
    },
  }));
}

/** Caso de estudio. Sin imagen por ahora: el material visual se va a renovar. */
export function creativeWorkNode(project: Project, description: string): Node {
  const url = absoluteUrl(`/proyectos/${project.slug}`);
  const keywords = [...project.categories, ...project.technologies];
  return {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: project.title,
    headline: project.title,
    description,
    url,
    inLanguage: "es-CO",
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    ...(project.demoUrl || project.repositoryUrl
      ? { sameAs: [project.demoUrl, project.repositoryUrl].filter((u): u is string => Boolean(u)) }
      : {}),
  };
}

export function graph(...nodes: (Node | Node[])[]) {
  return { "@context": "https://schema.org", "@graph": nodes.flat() };
}
