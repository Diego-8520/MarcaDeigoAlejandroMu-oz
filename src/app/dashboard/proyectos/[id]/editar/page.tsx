import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProject } from "@/actions/projects";
import {
  getProjectByIdAdmin,
  getProjectImagesAdmin,
} from "@/lib/data/projects-queries";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectImagesManager } from "@/components/projects/project-images-manager";
import {
  getSkillsAdmin,
  getSkillsByProjectAdmin,
} from "@/lib/data/skills-queries";

export const dynamic = "force-dynamic";

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, images, skills, selectedSkills] = await Promise.all([
    getProjectByIdAdmin(id),
    getProjectImagesAdmin(id),
    getSkillsAdmin(),
    getSkillsByProjectAdmin(id),
  ]);

  if (!project) notFound();

  const updateProjectWithId = updateProject.bind(null, project.id);

  return (
    <div>
      <Link
        href="/dashboard/proyectos"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink-muted">
            dashboard / proyectos
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Editar proyecto
          </h1>
        </div>
        <DeleteProjectButton
          id={project.id}
          redirectTo="/dashboard/proyectos"
        />
      </div>
      <ProjectForm
        action={updateProjectWithId}
        project={project}
        skills={skills}
        selectedSkillIds={selectedSkills.map((skill) => skill.id)}
        submitLabel="guardar cambios"
      />
      <ProjectImagesManager
        key={images.map((image) => image.id).join(":")}
        projectId={project.id}
        initialImages={images}
        suggestedImageUrl={project.featuredImageUrl}
      />
    </div>
  );
}
