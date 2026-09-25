import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Globe, ArrowRight } from "lucide-react";
import { Section, Tag } from "@/components/ui/section";
import { GithubIcon } from "@/components/ui/icons";
import { getProjectBySlug } from "@/lib/data/projects-queries";
import { getTestimonialsByProject } from "@/lib/data/testimonials-queries";
import { ProjectViewTracker } from "@/components/analytics/project-view-tracker";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  const title = `${project.title} — Caso de Estudio`;
  const description =
    project.shortDescription ??
    project.description?.slice(0, 160) ??
    `Caso de estudio técnico del proyecto ${project.title} desarrollado por Diego Alejandro Muñoz.`;

  const ogImages = project.featuredImageUrl
    ? [{ url: project.featuredImageUrl, width: 1200, height: 630, alt: project.title }]
    : project.images?.[0]
      ? [{ url: project.images[0].publicUrl, width: 1200, height: 630, alt: project.title }]
      : [];

  return {
    title,
    description,
    openGraph: {
      title: `${project.title} | Diego Alejandro Muñoz`,
      description,
      type: "article",
      images: ogImages,
    },
    alternates: {
      canonical: `/proyectos/${project.slug}`,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const testimonials = await getTestimonialsByProject(project.id);
  const primaryRepoUrl = project.repositoryUrl ?? project.githubMetadata?.repositoryUrl;

  return (
    <Section className="pt-14 lg:pt-20">
      <ProjectViewTracker projectId={project.id} />

      {/* Navegación de retroceso */}
      <Link
        href="/proyectos"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-signal transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        <span>volver a proyectos</span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-signal font-medium">
          {project.categories.join(" · ") || "Desarrollo de Software"}
        </span>
        <span className="font-mono text-[11px] text-ink-muted">· {project.status}</span>
      </div>

      <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
        {project.title}
      </h1>

      <p className="mt-4 max-w-2xl font-body text-base sm:text-lg leading-relaxed text-ink-muted">
        {project.shortDescription ?? project.description}
      </p>

      {/* Enlaces de acción directa */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-ink px-4 py-2 font-mono text-xs text-paper hover:bg-signal transition-colors"
          >
            <Globe size={13} />
            <span>visitar demo en producción</span>
            <ArrowUpRight size={13} />
          </a>
        )}
        {primaryRepoUrl && (
          <a
            href={primaryRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-line px-4 py-2 font-mono text-xs text-ink hover:border-signal hover:text-signal transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>ver repositorio en GitHub</span>
            <ArrowUpRight size={13} />
          </a>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.technologies.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {/* Galería de imágenes si existen */}
      {project.images && project.images.length > 0 && (
        <div className="mt-10 grid gap-4 border-t border-line pt-10">
          {project.images.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden border border-line bg-surface/70 rounded-sm ${
                index === 0 ? "aspect-video" : "aspect-video sm:aspect-[4/3]"
              }`}
            >
              <Image
                src={image.publicUrl}
                alt={image.altText ?? project.title}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Narrativa técnica: Problema vs Solución */}
      <div className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
        <div className="border border-line/70 p-6 bg-paper/60">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
            01 / El problema
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
            {project.problem ??
              "Dificultad o necesidad operativa previa que requería una solución digital estructurada y de alto rendimiento."}
          </p>
        </div>
        <div className="border border-line/70 p-6 bg-paper/60">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
            02 / La solución implementada
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
            {project.solution ??
              "Diseño e implementación de arquitectura frontend y backend adecuada, priorizando tipado, rapidez de respuesta y seguridad."}
          </p>
        </div>
      </div>

      {/* Resultados e impacto */}
      {project.results && (
        <div className="mt-8 border border-line p-6 bg-surface/70 rounded-sm">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
            03 / Resultados & aprendizajes
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
            {project.results}
          </p>
        </div>
      )}

      {/* Ficha técnica y metadatos */}
      {(project.githubMetadata || project.technologies.length > 0) && (
        <section className="mt-12 border-t border-line pt-10">
          <h2 className="font-display text-lg font-semibold text-ink">
            Ficha técnica del desarrollo
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs text-ink-muted">Tecnologías principales</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.technologies.map((technology) => (
                  <Tag key={technology}>{technology}</Tag>
                ))}
              </div>
            </div>

            {project.githubMetadata && (
              <div className="border border-line/60 p-4 bg-paper/40">
                <p className="font-mono text-xs text-ink-muted">Metadatos de repositorio</p>
                <p className="mt-1 font-mono text-xs text-ink font-semibold">
                  {project.githubMetadata.owner}/{project.githubMetadata.name}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink-muted">
                  Lenguaje: {project.githubMetadata.primaryLanguage ?? "TypeScript"} ·{" "}
                  {project.githubMetadata.stars} stars · {project.githubMetadata.forks} forks
                </p>
                {project.githubMetadata.topics.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    Tópicos: {project.githubMetadata.topics.join(" · ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonios vinculados si existen */}
      {testimonials.length > 0 && (
        <section className="mt-12 border-t border-line pt-10">
          <h2 className="font-display text-lg font-semibold text-ink">
            Testimonios sobre este proyecto
          </h2>
          <div className="mt-4 space-y-4">
            {testimonials.map((t) => (
              <figure key={t.id} className="bracket-frame border border-line p-5 bg-surface/70 rounded-sm">
                <blockquote className="font-body text-sm leading-relaxed text-ink-muted">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-3 font-mono text-xs text-ink">
                  <span className="font-semibold">{t.authorName}</span>
                  {(t.authorRole || t.authorCompany) && (
                    <span className="block text-ink-muted text-[11px]">
                      {[t.authorRole, t.authorCompany].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA de conversión al pie del caso de estudio */}
      <div className="mt-16 border-t border-line pt-10 pb-20">
        <div className="bracket-frame border border-line bg-paper/90 p-6 sm:p-8">
          <p className="font-mono text-xs text-signal font-medium">¿Te interesa una solución similar?</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-ink">
            Construyamos algo sólido para tu empresa
          </h3>
          <p className="mt-2 font-body text-sm text-ink-muted max-w-xl leading-relaxed">
            Puedo ayudarte a diseñar y desarrollar aplicaciones web a medida, optimizar procesos o estructurar tus datos con la misma rigurosidad técnica.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/contacto?proyecto=${encodeURIComponent(project.title)}`}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs text-paper hover:bg-signal transition-colors"
            >
              <span>hablemos sobre este tipo de proyecto</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/proyectos"
              className="inline-flex items-center gap-2 border border-line px-4 py-2.5 font-mono text-xs text-ink hover:border-signal hover:text-signal transition-colors"
            >
              ver más proyectos
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
