import { notFound } from "next/navigation";
import Image from "next/image";
import { Section, Tag } from "@/components/ui/section";
import { getProjectBySlug } from "@/lib/data/projects-queries";
import { getTestimonialsByProject } from "@/lib/data/testimonials-queries";
import { ProjectViewTracker } from "@/components/analytics/project-view-tracker";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const testimonials = await getTestimonialsByProject(project.id);

  return (
    <Section className="pt-16 lg:pt-24">
      <ProjectViewTracker projectId={project.id} />
      <p className="font-mono text-xs text-ink-muted">
        {project.categories.join(" · ")}
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        {project.title}
      </h1>
      <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-muted">
        {project.shortDescription}
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.technologies.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {project.images && project.images.length > 0 && (
        <div className="mt-10 grid gap-4 border-t border-line pt-10">
          {project.images.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden border border-line bg-white/40 ${
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

      <div className="mt-10 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            Problema
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.problem ?? "Pendiente por documentar."}
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            Solución
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.solution ?? "Pendiente por documentar."}
          </p>
        </div>
      </div>

      {project.results && (
        <div className="mt-10 border-t border-line pt-10">
          <h2 className="font-display text-base font-semibold text-ink">
            Resultados
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.results}
          </p>
        </div>
      )}

      {testimonials.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-display text-base font-semibold text-ink">
            Lo que dicen mis clientes
          </h2>
          <div className="mt-5 space-y-4">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="bracket-frame border border-line p-5"
              >
                <blockquote className="font-body text-sm leading-relaxed text-ink-muted">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-4 font-mono text-xs text-ink">
                  <span className="font-semibold">
                    {testimonial.authorName}
                  </span>
                  {(testimonial.authorRole || testimonial.authorCompany) && (
                    <span className="mt-1 block text-ink-muted">
                      {[testimonial.authorRole, testimonial.authorCompany]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {(project.technologies.length > 0 ||
        project.githubMetadata ||
        project.demoUrl ||
        project.repositoryUrl ||
        project.vercelProjectUrl ||
        project.vercelProductionUrl ||
        project.vercelCustomDomain ||
        project.vercelDeploymentStatus) && (
        <section className="mt-10 border-t border-line pt-10">
          <h2 className="font-display text-base font-semibold text-ink">
            Ficha técnica
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {project.technologies.length > 0 && (
              <div>
                <p className="font-mono text-xs text-ink-muted">Tecnologías</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.technologies.map((technology) => (
                    <Tag key={technology}>{technology}</Tag>
                  ))}
                </div>
              </div>
            )}

            {project.githubMetadata && (
              <div>
                <p className="font-mono text-xs text-ink-muted">GitHub</p>
                <p className="mt-2 font-body text-sm text-ink">
                  {project.githubMetadata.owner}/{project.githubMetadata.name}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink-muted">
                  {project.githubMetadata.primaryLanguage ??
                    "Lenguaje no detectado"}
                  {project.githubMetadata.defaultBranch
                    ? ` · rama ${project.githubMetadata.defaultBranch}`
                    : ""}
                  {` · ${project.githubMetadata.stars} stars · ${project.githubMetadata.forks} forks`}
                </p>
                {project.githubMetadata.topics.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    temas: {project.githubMetadata.topics.join(" · ")}
                  </p>
                )}
                {Object.keys(project.githubMetadata.languages).length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    lenguajes:{" "}
                    {Object.keys(project.githubMetadata.languages).join(" · ")}
                  </p>
                )}
                <a
                  href={
                    project.repositoryUrl ??
                    project.githubMetadata.repositoryUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-mono text-xs text-signal hover:underline"
                >
                  ver repositorio →
                </a>
              </div>
            )}

            {project.demoUrl && (
              <div>
                <p className="font-mono text-xs text-ink-muted">Producción</p>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all font-mono text-xs text-signal hover:underline"
                >
                  {project.demoUrl}
                </a>
              </div>
            )}

            {project.vercelProductionUrl && (
              <div>
                <p className="font-mono text-xs text-ink-muted">Vercel</p>
                <a
                  href={project.vercelProductionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all font-mono text-xs text-signal hover:underline"
                >
                  {project.vercelProductionUrl}
                </a>
                {project.vercelDeploymentStatus && (
                  <p className="mt-1 font-mono text-[11px] text-ink-muted">
                    deployment: {project.vercelDeploymentStatus}
                  </p>
                )}
              </div>
            )}

            {project.vercelProjectUrl && (
              <div>
                <p className="font-mono text-xs text-ink-muted">
                  Proyecto Vercel
                </p>
                <a
                  href={project.vercelProjectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all font-mono text-xs text-signal hover:underline"
                >
                  abrir proyecto →
                </a>
              </div>
            )}

            {project.vercelCustomDomain && (
              <div>
                <p className="font-mono text-xs text-ink-muted">Dominio</p>
                <p className="mt-2 break-all font-mono text-xs text-ink">
                  {project.vercelCustomDomain}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-4 border-t border-line pt-10 font-mono text-sm">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-signal hover:underline"
          >
            ver demo →
          </a>
        )}
        {(project.repositoryUrl || project.githubMetadata?.repositoryUrl) && (
          <a
            href={
              project.repositoryUrl ?? project.githubMetadata?.repositoryUrl
            }
            target="_blank"
            rel="noreferrer"
            className="text-signal hover:underline"
          >
            repositorio →
          </a>
        )}
      </div>
    </Section>
  );
}
