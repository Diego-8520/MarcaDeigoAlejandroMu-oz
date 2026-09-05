import Link from "next/link";
import { notFound } from "next/navigation";
import { updateExperience } from "@/actions/experiences";
import { ExperienceForm } from "@/components/experiences/experience-form";
import { getExperienceAdmin } from "@/lib/data/experiences-queries";

export const dynamic = "force-dynamic";

export default async function EditarExperienciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await getExperienceAdmin(id);
  if (!experience) notFound();
  return (
    <div>
      <Link
        href="/dashboard/experiencia"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">
        dashboard / experiencia
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Editar experiencia
      </h1>
      <ExperienceForm
        action={updateExperience.bind(null, experience.id)}
        experience={experience}
        submitLabel="guardar cambios"
      />
    </div>
  );
}
