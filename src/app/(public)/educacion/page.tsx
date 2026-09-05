import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { getCertifications, getEducation } from "@/lib/data/education-queries";

export const metadata: Metadata = {
  title: "Educación — Diego Alejandro Muñoz",
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

export default async function EducacionPage() {
  const [education, certifications] = await Promise.all([
    getEducation(),
    getCertifications(),
  ]);

  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">educación</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Formación académica y técnica
      </h1>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Formación académica
        </h2>
        {education.length === 0 ? (
          <p className="mt-5 font-body text-sm text-ink-muted">
            No hay formación registrada todavía.
          </p>
        ) : (
          <div className="mt-6 border-t border-line">
            {education.map((item) => (
              <article key={item.id} className="border-b border-line py-7">
                <p className="font-mono text-xs text-ink-muted">
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {item.program}
                </h3>
                <p className="mt-1 font-display text-base text-ink">
                  {item.institution}
                </p>
                {item.status && (
                  <p className="mt-2 font-mono text-xs text-signal">
                    {item.status}
                  </p>
                )}
                {item.description && (
                  <p className="mt-4 max-w-2xl whitespace-pre-line font-body text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Certificaciones
        </h2>
        {certifications.length === 0 ? (
          <p className="mt-5 font-body text-sm text-ink-muted">
            No hay certificaciones registradas todavía.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-line border-y border-line">
            {certifications.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-5"
              >
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {item.name}
                  </h3>
                  {item.issuer && (
                    <p className="mt-1 font-body text-sm text-ink-muted">
                      {item.issuer}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 font-mono text-xs text-ink-muted">
                  {item.issueDate && <span>{formatDate(item.issueDate)}</span>}
                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal hover:underline"
                    >
                      ver credencial →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Section>
  );
}
