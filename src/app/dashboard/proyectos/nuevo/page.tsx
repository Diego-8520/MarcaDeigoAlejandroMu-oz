import Link from "next/link";
import { createProject } from "@/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";

export default function NuevoProyectoPage() {
  return (
    <div>
      <Link
        href="/dashboard/proyectos"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">dashboard / proyectos</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Nuevo proyecto
      </h1>
      <ProjectForm action={createProject} submitLabel="crear proyecto" />
    </div>
  );
}
