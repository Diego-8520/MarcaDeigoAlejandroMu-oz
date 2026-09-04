import { notFound } from "next/navigation";
import Image from "next/image";
import { Section, Tag } from "@/components/ui/section";
import { getProjectBySlug } from "@/lib/data/projects-queries";
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
          <h2 className="font-display text-base font-semibold text-ink">Problema</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.problem ?? "Pendiente por documentar."}
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Solución</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.solution ?? "Pendiente por documentar."}
          </p>
        </div>
      </div>

      {project.results && (
        <div className="mt-10 border-t border-line pt-10">
          <h2 className="font-display text-base font-semibold text-ink">Resultados</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
            {project.results}
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4 border-t border-line pt-10 font-mono text-sm">
        {project.demoUrl && (
          <a href={project.demoUrl} className="text-signal hover:underline">
            ver demo →
          </a>
        )}
        {project.repositoryUrl && (
          <a href={project.repositoryUrl} className="text-signal hover:underline">
            repositorio →
          </a>
        )}
      </div>
    </Section>
  );
}
