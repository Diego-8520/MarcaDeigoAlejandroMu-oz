import Link from "next/link";
import { getExperiencesAdmin } from "@/lib/data/experiences-queries";
import { ExperiencesList } from "@/components/experiences/experiences-list";

export const dynamic = "force-dynamic";

export default async function ExperienciaPage() {
  const experiences = await getExperiencesAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink-muted">
            dashboard / experiencia
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Experiencia
          </h1>
        </div>
        <Link
          href="/dashboard/experiencia/nuevo"
          className="inline-flex items-center bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal"
        >
          nueva experiencia
        </Link>
      </div>
      <ExperiencesList
        key={experiences.map((experience) => experience.id).join(":")}
        initialExperiences={experiences}
      />
    </div>
  );
}
