import Link from "next/link";
import { createExperience } from "@/actions/experiences";
import { ExperienceForm } from "@/components/experiences/experience-form";

export default function NuevaExperienciaPage() {
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
        Nueva experiencia
      </h1>
      <ExperienceForm
        action={createExperience}
        submitLabel="crear experiencia"
      />
    </div>
  );
}
