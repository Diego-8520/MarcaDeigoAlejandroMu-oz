import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { getExperiences } from "@/lib/data/experiences-queries";

export const metadata: Metadata = {
  title: "Experiencia — Diego Alejandro Muñoz",
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "presente";
  const formatted = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function ExperienciaPage() {
  const experiences = await getExperiences();

  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">experiencia</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Trayectoria profesional
      </h1>

      {experiences.length === 0 ? (
        <p className="mt-8 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
          La trayectoria profesional se publicará próximamente.
        </p>
      ) : (
        <div className="mt-10 border-t border-line">
          {experiences.map((experience) => (
            <article key={experience.id} className="border-b border-line py-8">
              <p className="font-mono text-xs text-ink-muted">
                {formatDate(experience.startDate)} —{" "}
                {formatDate(experience.endDate)}
              </p>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">
                {experience.position}
              </h2>
              <p className="mt-1 font-display text-base text-ink">
                {experience.company}
              </p>
              {experience.description && (
                <p className="mt-4 max-w-2xl whitespace-pre-line font-body text-sm leading-relaxed text-ink-muted">
                  {experience.description}
                </p>
              )}
              {experience.achievements.length > 0 && (
                <ul className="mt-5 max-w-2xl space-y-2 font-body text-sm leading-relaxed text-ink-muted">
                  {experience.achievements.map((achievement) => (
                    <li key={achievement} className="flex gap-3">
                      <span className="font-mono text-signal">+</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
