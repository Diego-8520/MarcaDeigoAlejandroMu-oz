import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Proyectos — Diego Alejandro Muñoz",
  description: "Catálogo de proyectos: aplicaciones web, IA y automatización.",
};

export default function ProyectosPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">proyectos</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Cada proyecto es un caso de estudio
      </h1>
      <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
        Problema, solución, arquitectura y resultados — no solo capturas de pantalla.
      </p>
      <div className="mt-10">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </Section>
  );
}
