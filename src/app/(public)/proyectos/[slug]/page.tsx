import type { Metadata } from "next";
import type { Project, ProjectImage } from "@/types/project";
import { NO_INDEX, pageMetadata } from "@/lib/seo";
import { SERVICE_NAMES, servicesForProject } from "@/lib/site";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import { Tag } from "@/components/ui/section";
import { GithubIcon } from "@/components/ui/icons";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SplitReveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Counter } from "@/components/motion/counter";
import { BrowserFrame, domainOf, type FrameImage } from "@/components/project/frames";
import { ProjectHero } from "@/components/project/project-hero";
import { ProjectTour, type TourItem } from "@/components/project/project-tour";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects-queries";
import { getTestimonialsByProject } from "@/lib/data/testimonials-queries";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, creativeWorkNode, graph, personRef } from "@/lib/schema";

export const revalidate = 60;

function toFrame(image: ProjectImage, title: string): FrameImage {
  return { src: image.publicUrl, alt: image.altText ?? title, width: image.width, height: image.height };
}

/**
 * Reparte las imágenes: hero de escritorio (captura `desktop`, si no la
 * portada o la primera imagen), vista móvil y el resto para el recorrido.
 */
function projectMedia(project: Project) {
  const images = project.images ?? [];
  const desktopShot = images.find((img) => img.kind === "desktop");
  const mobileShot = images.find((img) => img.kind === "mobile");

  let hero: FrameImage | null = null;
  let heroId: string | null = null;
  if (desktopShot) {
    hero = toFrame(desktopShot, project.title);
    heroId = desktopShot.id;
  } else if (project.featuredImageUrl) {
    hero = { src: project.featuredImageUrl, alt: project.title };
  } else if (images[0]) {
    hero = toFrame(images[0], project.title);
    heroId = images[0].id;
  }

  const tour: TourItem[] = images
    .filter((img) => img.id !== heroId && img.kind !== "mobile" && img.publicUrl !== project.featuredImageUrl)
    .map((img) => ({ ...toFrame(img, project.title), id: img.id, caption: img.caption }));

  return { hero, mobile: mobileShot ? toFrame(mobileShot, project.title) : null, tour };
}

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

  const { hero } = projectMedia(project);
  const ogImages = hero
    ? [{ url: hero.src, width: hero.width ?? 1200, height: hero.height ?? 630, alt: hero.alt }]
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

const STATUS_BADGE: Record<string, "live" | "en-desarrollo" | "tech"> = {
  live: "live",
  "en-desarrollo": "en-desarrollo",
  archivado: "tech",
};

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

  const { hero, mobile, tour } = projectMedia(project);
  const domain = domainOf(project.demoUrl ?? project.vercelProductionUrl);
  const year = new Date(project.createdAt).getFullYear();

  const position = allProjects.findIndex((p) => p.slug === project.slug);
  const next = allProjects.length > 1 ? allProjects[(position + 1) % allProjects.length] : null;
  const nextCover = next ? projectMedia(next).hero : null;

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
          className="tap group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={13} className="transition-transform duration-500 ease-expo group-hover:-translate-x-1" />
          <span>Volver a proyectos</span>
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
          <span className="text-signal">{project.categories.join(" · ") || "Desarrollo de Software"}</span>
          <span aria-hidden="true" className="h-px w-10 bg-line-focus" />
          <span className="text-ink-muted">{year}</span>
          <Badge variant={STATUS_BADGE[project.status] ?? "tech"}>{STATUS_LABEL[project.status] ?? project.status}</Badge>
        </div>

        <ViewTransition name={`project-title-${project.slug}`} share="project-morph">
          <SplitReveal as="h1" immediate className="display display-lg mt-6 text-ink">
            {project.title}
          </SplitReveal>
        </ViewTransition>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-6">
          <p className="eyebrow lg:col-span-3">Caso de estudio</p>
          <Reveal immediate delay={0.2} className="lg:col-span-7 lg:col-start-5">
            <p className="lede">{project.shortDescription ?? project.description}</p>
          </Reveal>
        </div>
      </header>

      {/* Imagen principal a sangre (se transforma desde la vista previa del índice) */}
      {hero && (
        <div className="container-x">
          <ProjectHero slug={project.slug} desktop={hero} mobile={mobile} domain={domain} />
        </div>
      )}

      {/* Datos clave */}
      <dl className="container-x mt-16 grid grid-cols-2 border-y border-line font-mono text-xs sm:mt-20 lg:grid-cols-4">
        {[
          { label: "Estado", value: STATUS_LABEL[project.status] ?? project.status },
          { label: "Año", value: String(year) },
          { label: "Stack", value: <><Counter value={project.technologies.length} /> tecnologías</> },
          project.githubMetadata
            ? { label: "GitHub", value: <><Counter value={project.githubMetadata.stars} /> stars · {project.githubMetadata.primaryLanguage ?? "—"}</> }
            : { label: "Entrega", value: domain ?? "Repositorio privado" },
        ].map((fact, i) => (
          <div key={fact.label} className={`py-6 pr-4 ${i % 2 === 1 ? "border-l border-line pl-4 lg:pl-6" : ""} ${i === 2 ? "border-t border-line lg:border-l lg:border-t-0 lg:pl-6" : ""} ${i === 3 ? "border-t border-line lg:border-t-0" : ""}`}>
            <dt className="eyebrow">{fact.label}</dt>
            <dd className="mt-2 text-sm uppercase tracking-[0.04em] text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>

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

            {servicesForProject(project.slug).length > 0 && (
              <div className="border-t border-line pt-6">
                <p className="eyebrow">Servicio relacionado</p>
                <ul className="mt-2 space-y-1">
                  {servicesForProject(project.slug).map((s) => (
                    <li key={s}>
                      <Link href={`/servicios#${s}`} className="link-draw tap text-ink hover:text-signal">
                        {SERVICE_NAMES[s]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.demoUrl || primaryRepoUrl) && (
              <div className="flex flex-col gap-2 border-t border-line pt-6">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "signal", size: "md", className: "tap-area justify-between" })}>
                    <span className="flex items-center gap-2">
                      <Globe aria-hidden="true" size={13} />
                      Demo en producción
                    </span>
                    <ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                )}
                {primaryRepoUrl && (
                  <a href={primaryRepoUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "md", className: "tap-area justify-between" })}>
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
                    <p className={`mt-6 max-w-[62ch] whitespace-pre-line text-lg leading-relaxed text-ink-muted ${i === 0 ? "dropcap" : ""}`}>
                      {chapter.body}
                    </p>
                  </Reveal>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Recorrido por las secciones clave */}
      {tour.length > 0 && (
        <section aria-labelledby="recorrido" className="container-x border-t border-line py-20 sm:py-28">
          <div className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <p className="eyebrow lg:col-span-3">
              <span className="text-signal">{String(chapters.length + 1).padStart(2, "0")} —</span> Recorrido
            </p>
            <SplitReveal id="recorrido" className="display display-md text-ink lg:col-span-9">
              El producto, <span className="font-serif">sección</span> por sección
            </SplitReveal>
          </div>
          <ProjectTour items={tour} domain={domain} />
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

      {/* Siguiente proyecto: a pantalla completa, la portada se revela en hover */}
      {next && (
        <Link href={`/proyectos/${next.slug}`} className="group block border-t border-line bg-surface">
          <div className="container-x grid min-h-[80svh] grid-cols-1 content-center gap-10 py-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                <span className="text-signal">→</span> Siguiente proyecto
              </span>
              <span className="display display-lg stretch-hover mt-6 block text-ink transition-colors duration-500 group-hover:text-signal">
                {next.title}
              </span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.25}
                className="mt-8 h-12 w-12 text-ink transition-transform duration-700 ease-expo group-hover:translate-x-3 group-hover:text-signal sm:h-16 sm:w-16"
              />
            </div>
            {nextCover && (
              <div className="transition-[clip-path] duration-[900ms] ease-expo lg:col-span-6 lg:[clip-path:inset(0_0_100%_0)] lg:group-hover:[clip-path:inset(0_0_0_0)] lg:group-focus-visible:[clip-path:inset(0_0_0_0)]">
                <BrowserFrame image={nextCover} domain={domainOf(next.demoUrl)} sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            )}
          </div>
        </Link>
      )}
    </article>
  );
}
