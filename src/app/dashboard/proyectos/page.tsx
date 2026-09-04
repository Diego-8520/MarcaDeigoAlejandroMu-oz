import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects-queries";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink-muted">dashboard / proyectos</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Proyectos
          </h1>
        </div>
        <Link
          href="/dashboard/proyectos/nuevo"
          className="inline-flex items-center bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal"
        >
          nuevo proyecto
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border-y border-line">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-xs text-ink-muted">
              <th className="py-3 pr-4 font-normal">título</th>
              <th className="px-4 py-3 font-normal">slug</th>
              <th className="px-4 py-3 font-normal">estado</th>
              <th className="px-4 py-3 font-normal">publicado</th>
              <th className="px-4 py-3 font-normal">destacado</th>
              <th className="py-3 pl-4 font-normal">acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-line last:border-b-0">
                <td className="py-4 pr-4 font-body text-sm text-ink">{project.title}</td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {project.slug}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {project.status}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex border border-line px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                    {project.published ? "sí" : "no"}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {project.featured ? "sí" : "no"}
                </td>
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/proyectos/${project.id}/editar`}
                      className="font-mono text-xs text-signal hover:underline"
                    >
                      editar
                    </Link>
                    <DeleteProjectButton id={project.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <p className="mt-6 font-body text-sm text-ink-muted">
          Todavía no hay proyectos registrados.
        </p>
      )}
    </div>
  );
}
