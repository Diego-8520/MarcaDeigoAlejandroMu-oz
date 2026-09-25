import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/projects/project-card";
import { getPublishedProjects } from "@/lib/data/projects-queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Proyectos y Casos de Estudio",
  description:
    "Catálogo de aplicaciones web, e-commerce, herramientas interactivas y automatizaciones desarrolladas por Diego Alejandro Muñoz.",
};

export default async function ProyectosPage() {
  const projects = await getPublishedProjects();

  return (
    <div>
      <Section className="max-w-4xl pt-16 pb-12 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">portafolio & código</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
          Proyectos y casos de estudio
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
          Cada desarrollo responde a un problema concreto: análisis de riesgo geoespacial, comercio electrónico con base de datos en tiempo real, landing pages de alta conversión o automatización de flujos con APIs.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono text-ink-muted">
          <span className="border border-line bg-surface/70 px-2.5 py-1 rounded-sm">
            Total proyectos activos: <strong className="text-ink">{projects.length}</strong>
          </span>
          <span className="border border-line bg-surface/70 px-2.5 py-1 rounded-sm">
            Next.js · React · TypeScript · C# .NET · Supabase
          </span>
        </div>
      </Section>

      <Section className="border-t border-line">
        <div className="space-y-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="mt-8 font-body text-sm text-ink-muted">
            Todavía no hay proyectos publicados.
          </p>
        )}
      </Section>

      {/* CTA final */}
      <Section className="border-t border-line pb-28">
        <div className="border border-line bg-paper/80 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              ¿Quieres revisar el código o discutir una solución?
            </h2>
            <p className="mt-2 font-body text-sm text-ink-muted max-w-lg">
              La mayoría de proyectos cuentan con repositorios abiertos en GitHub y demostraciones en vivo verificables.
            </p>
          </div>
          <div className="flex flex-none flex-wrap gap-3">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs text-paper hover:bg-signal transition-colors"
            >
              iniciar conversación
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
