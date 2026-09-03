import { notFound } from "next/navigation";
import { Section, Tag } from "@/components/ui/section";
import { projects } from "@/lib/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <Section className="pt-16 lg:pt-24">
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
