import type { Metadata } from "next";
import type { Project } from "@/types/project";
import { NO_INDEX, pageMetadata } from "@/lib/seo";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import { Tag } from "@/components/ui/section";
import { GithubIcon } from "@/components/ui/icons";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SplitReveal } from "@/components/motion/reveal";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects-queries";
import { getTestimonialsByProject } from "@/lib/data/testimonials-queries";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, creativeWorkNode, graph, personRef } from "@/lib/schema";

export const revalidate = 60;

/** Descripción corta del caso: la misma para metadata y datos estructurados. */
function projectDescription(project: Project): string {
  return (
    project.shortDescription ??
    project.description?.slice(0, 160) ??
    `Caso de estudio técnico del proyecto ${project.title} desarrollado por Diego Alejandro Muñoz.`
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Proyecto no encontrado", robots: NO_INDEX };
  }

  const title = `${project.title} — Caso de Estudio`;
  const description = projectDescription(project);

  const ogImages = project.featuredImageUrl
    ? [{ url: project.featuredImageUrl, width: 1200, height: 630, alt: project.title }]
    : project.images?.[0]
      ? [{ url: project.images[0].publicUrl, width: 1200, height: 630, alt: project.title }]
      : [];

  return pageMetadata({
    title,
    description,
    path: `/proyectos/${project.slug}`,
    openGraph: { type: "article", images: ogImages },
  });
}

/** Prerenderiza los casos publicados; los nuevos se generan bajo demanda (ISR). */
export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const STATUS_LABEL: Record<string, string> = {
  live: "En vivo",
  "en-desarrollo": "En desarrollo",
  archivado: "Archivado",
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);

  if (!project) notFound();

  const testimonials = await getTestimonialsByProject(project.id);
  const primaryRepoUrl = project.repositoryUrl ?? project.githubMetadata?.repositoryUrl;

  const heroUrl = project.featuredImageUrl || project.images?.[0]?.publicUrl || null;
  const heroAlt = project.images?.[0]?.altText ?? project.title;
  const gallery = (project.images ?? []).filter((img) => img.publicUrl !== heroUrl);

  const position = allProjects.findIndex((p) => p.slug === project.slug);
  const next = allProjects.length > 1 ? allProjects[(position + 1) % allProjects.length] : null;

  const chapters = [
    {
      key: "problema",
      title: "El problema",
      body:
        project.problem ??
        "Dificultad o necesidad operativa previa que requería una solución digital estructurada y de alto rendimiento.",
    },
    {
      key: "solucion",
      title: "La solución implementada",
      body:
        project.solution ??
        "Diseño e implementación de arquitectura frontend y backend adecuada, priorizando tipado, rapidez de respuesta y seguridad.",
    },
    ...(project.results ? [{ key: "resultados", title: "Resultados & aprendizajes", body: project.results }] : []),
  ];

  return (
    <article>
      <JsonLd
        data={graph(
          personRef(),
          creativeWorkNode(project, projectDescription(project)),
          breadcrumbNode([
            { name: "Proyectos", path: "/proyectos" },
            { name: project.title, path: `/proyectos/${project.slug}` },
          ]),
        )}
      />

      {/* Cabecera */}
      <header className="container-x pb-12 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
        <Link
          href="/proyectos"
          transitionTypes={["nav-back"]}
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={13} className="transition-transform duration-500 ease-expo group-hover:-translate-x-1" />
          <span>Volver a proyectos</span>
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
          <span className="text-signal">{project.categories.join(" · ") || "Desarrollo de Software"}</span>
          <span aria-hidden="true" className="h-px w-10 bg-line-focus" />
          <span className={project.status === "live" ? "text-emerald" : "text-ink-muted"}>{STATUS_LABEL[project.status] ?? project.status}</span>
        </div>

        <ViewTransition name={`project-title-${project.slug}`} share="project-morph">
          <h1 className="display display-lg mt-6 text-ink">{project.title}</h1>
        </ViewTransition>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-6">
          <p className="lede lg:col-span-7 lg:col-start-5">{project.shortDescription ?? project.description}</p>
        </div>
      </header>

      {/* Imagen principal a sangre (se transforma desde la vista previa del índice) */}
      {heroUrl && (
        <div className="container-x">
          <ViewTransition name={`project-media-${project.slug}`} share="project-morph">
            <div className="relative aspect-[16/10] max-h-[86vh] w-full overflow-hidden border border-line bg-surface sm:aspect-[16/9]">
              <Image src={heroUrl} alt={heroAlt} fill priority sizes="(min-width: 1600px) 1600px, 100vw" className="object-cover" />
            </div>
          </ViewTransition>
        </div>
      )}

      {/* Cuerpo: ficha técnica pegada al margen + capítulos */}
      <div className="container-x grid grid-cols-1 gap-16 py-20 sm:py-28 lg:grid-cols-12 lg:gap-6">
        <aside className="lg:col-span-3">
          <div className="space-y-8 font-mono text-xs lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <div>
              <p className="eyebrow">Ficha técnica</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>

            {project.githubMetadata && (
              <dl className="space-y-3 border-t border-line pt-6">
                <div>
                  <dt className="eyebrow">Repositorio</dt>
                  <dd className="mt-1 break-all text-ink">
                    {project.githubMetadata.owner}/{project.githubMetadata.name}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Lenguaje</dt>
                  <dd className="mt-1 text-ink">{project.githubMetadata.primaryLanguage ?? "TypeScript"}</dd>
                </div>
                <div className="flex gap-6">
                  <div>
                    <dt className="eyebrow">Stars</dt>
                    <dd className="mt-1 text-ink">{project.githubMetadata.stars}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Forks</dt>
                    <dd className="mt-1 text-ink">{project.githubMetadata.forks}</dd>
                  </div>
                </div>
                {project.githubMetadata.topics.length > 0 && (
                  <div>
                    <dt className="eyebrow">Tópicos</dt>
                    <dd className="mt-1 text-ink-muted">{project.githubMetadata.topics.join(" · ")}</dd>
                  </div>
                )}
              </dl>
            )}

            {(project.demoUrl || primaryRepoUrl) && (
              <div className="flex flex-col gap-2 border-t border-line pt-6">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "signal", size: "md", className: "justify-between" })}>
                    <span className="flex items-center gap-2">
                      <Globe aria-hidden="true" size={13} />
                      Demo en producción
                    </span>
                    <ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                )}
                {primaryRepoUrl && (
                  <a href={primaryRepoUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "md", className: "justify-between" })}>
                    <span className="flex items-center gap-2">
                      <GithubIcon className="h-3.5 w-3.5" />
                      Repositorio en GitHub
                    </span>
                    <ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-20 lg:col-span-8 lg:col-start-5">
          {chapters.map((chapter, i) => (
            <section key={chapter.key} aria-labelledby={`cap-${chapter.key}`} className="border-t border-line pt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-8">
                <span className="display text-5xl text-signal sm:col-span-2">{String(i + 1).padStart(2, "0")}</span>
                <div className="sm:col-span-6">
                  <SplitReveal id={`cap-${chapter.key}`} className="display display-sm text-ink">
                    {chapter.title}
                  </SplitReveal>
                  <Reveal>
                    <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-muted">{chapter.body}</p>
                  </Reveal>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Galería */}
      {gallery.length > 0 && (
        <section aria-label="Galería del proyecto" className="container-x grid grid-cols-1 gap-6 pb-24 sm:grid-cols-12">
          {gallery.map((image, i) => (
            <Reveal
              key={image.id}
              className={`relative overflow-hidden border border-line bg-surface ${
                i % 3 === 0 ? "aspect-[16/9] sm:col-span-12" : "aspect-[4/3] sm:col-span-6"
              }`}
            >
              <Image
                src={image.publicUrl}
                alt={image.altText ?? project.title}
                fill
                sizes={i % 3 === 0 ? "(min-width: 1600px) 1600px, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                className="object-cover"
              />
            </Reveal>
          ))}
        </section>
      )}

      {/* Testimonios vinculados */}
      {testimonials.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <p className="eyebrow">Testimonios sobre este proyecto</p>
          <div className="mt-10 space-y-14">
            {testimonials.map((t) => (
              <figure key={t.id} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <blockquote className="font-serif text-[clamp(1.6rem,3vw,2.8rem)] italic leading-tight text-ink lg:col-span-8 lg:col-start-4">
                  “{t.quote}”
                </blockquote>
                <figcaption className="font-mono text-xs uppercase tracking-[0.08em] lg:col-span-8 lg:col-start-4">
                  <span className="text-ink">{t.authorName}</span>
                  {(t.authorRole || t.authorCompany) && (
                    <span className="block text-ink-muted">{[t.authorRole, t.authorCompany].filter(Boolean).join(" · ")}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA de conversión */}
      <section className="container-x border-t border-line py-16 sm:py-20">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-4">
            <p className="eyebrow text-signal">¿Te interesa una solución similar?</p>
            <h2 className="display display-sm mt-4 text-ink">Construyamos algo sólido para tu empresa</h2>
            <p className="mt-4 max-w-[56ch] text-ink-muted">
              Puedo ayudarte a diseñar y desarrollar aplicaciones web a medida, optimizar procesos o estructurar tus datos con la misma
              rigurosidad técnica.
            </p>
          </div>
          <div className="lg:col-span-2 lg:justify-self-end">
            <Link href={`/contacto?proyecto=${encodeURIComponent(project.title)}`} className={buttonVariants({ variant: "primary", size: "lg" })}>
              <span>Hablemos</span>
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Siguiente proyecto */}
      {next && (
        <Link
          href={`/proyectos/${next.slug}`}
          className="group block border-t border-line bg-surface transition-colors duration-500 hover:bg-signal"
        >
          <div className="container-x flex flex-col gap-6 py-16 sm:py-24">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted group-hover:text-signal-ink">
              Siguiente proyecto
            </span>
            <span className="flex items-end justify-between gap-6">
              <span className="display display-lg text-ink transition-colors group-hover:text-signal-ink">{next.title}</span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.25}
                className="h-12 w-12 flex-none text-ink transition-transform duration-700 ease-expo group-hover:translate-x-2 group-hover:text-signal-ink sm:h-20 sm:w-20"
              />
            </span>
          </div>
        </Link>
      )}
    </article>
  );
}
