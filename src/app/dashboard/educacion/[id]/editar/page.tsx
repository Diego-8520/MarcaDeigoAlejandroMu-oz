import Link from "next/link";
import { notFound } from "next/navigation";
import { updateEducation } from "@/actions/education";
import { EducationForm } from "@/components/education/education-form";
import { getEducationByIdAdmin } from "@/lib/data/education-queries";

export const dynamic = "force-dynamic";

export default async function EditarEducacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const education = await getEducationByIdAdmin(id);
  if (!education) notFound();
  return (
    <div>
      <Link
        href="/dashboard/educacion"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">
        dashboard / educación
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Editar formación
      </h1>
      <EducationForm
        action={updateEducation.bind(null, education.id)}
        education={education}
        submitLabel="guardar cambios"
      />
    </div>
  );
}
