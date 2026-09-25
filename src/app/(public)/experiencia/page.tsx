import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, ExternalLink, GraduationCap, Briefcase, Award } from "lucide-react";
import { Section } from "@/components/ui/section";
import { getExperiences } from "@/lib/data/experiences-queries";
import { getEducation, getCertifications } from "@/lib/data/education-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Experiencia Laboral, Formación & Credenciales",
  description:
    "Trayectoria profesional de Diego Alejandro Muñoz: experiencia técnica en Juniper Travel Technology, formación en Ingeniería de Sistemas y certificaciones.",
};

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
  const [experiences, education, certifications] = await Promise.all([
    getExperiences(),
    getEducation(),
    getCertifications(),
  ]);

  return (
    <div>
      <Section className="max-w-4xl pt-16 pb-12 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">trayectoria & credenciales</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
          Experiencia, formación y método
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
          Mi camino combina rigor analítico, gestión de procesos complejos y desarrollo de software aplicado. No hay títulos inventados: aquí está la evidencia de lo que he hecho y lo que estoy estudiando.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper hover:bg-signal transition-colors"
          >
            <FileText size={15} />
            <span>descargar cv en pdf</span>
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-sm text-ink hover:border-signal hover:text-signal transition-colors"
          >
            <span>contactar</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      {/* 1. Experiencia Laboral */}
      <Section className="border-t border-line">
        <div className="flex items-center gap-2 font-mono text-xs text-signal font-semibold">
          <Briefcase size={16} />
          <span>01 / EXPERIENCIA LABORAL</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
          Historial profesional
        </h2>

        <div className="mt-8 border-t border-line divide-y divide-line">
          {experiences.map((exp) => (
            <article key={exp.id} className="py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-xs text-ink-muted">
                  {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                </span>
                <span className="font-mono text-xs text-signal font-medium">
                  {exp.company}
                </span>
              </div>

              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {exp.position}
              </h3>

              {exp.description && (
                <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-ink-muted">
                  {exp.description}
                </p>
              )}

              {exp.achievements.length > 0 && (
                <div className="mt-4 border-l-2 border-line pl-4">
                  <p className="font-mono text-xs text-ink-muted font-medium mb-2">
                    Responsabilidades clave y resultados:
                  </p>
                  <ul className="space-y-1.5 font-body text-xs leading-relaxed text-ink-muted">
                    {exp.achievements.map((ach) => (
                      <li key={ach} className="flex gap-2">
                        <span className="font-mono text-signal">+</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* 2. Formación Académica */}
      <Section id="educacion" className="border-t border-line">
        <div className="flex items-center gap-2 font-mono text-xs text-signal font-semibold">
          <GraduationCap size={16} />
          <span>02 / FORMACIÓN ACADÉMICA</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
          Educación técnica y universitaria
        </h2>

        <div className="mt-8 border-t border-line divide-y divide-line">
          {education.map((item) => (
            <article key={item.id} className="py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-xs text-ink-muted">
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </span>
                {item.status && (
                  <span className="font-mono text-xs text-signal px-2 py-0.5 border border-signal/30 bg-signal-dim/30">
                    {item.status}
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                {item.program}
              </h3>
              <p className="font-display text-sm text-ink-muted">{item.institution}</p>

              {item.description && (
                <p className="mt-3 max-w-2xl font-body text-xs leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      {/* 3. Certificaciones */}
      {certifications.length > 0 && (
        <Section className="border-t border-line">
          <div className="flex items-center gap-2 font-mono text-xs text-signal font-semibold">
            <Award size={16} />
            <span>03 / CERTIFICACIONES & CREDENCIALES</span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Validación de habilidades
          </h2>

          <div className="mt-6 border-y border-line divide-y divide-line">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink">{cert.name}</h3>
                  {cert.issuer && (
                    <p className="font-body text-xs text-ink-muted">{cert.issuer}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 font-mono text-xs text-ink-muted">
                  {cert.issueDate && <span>{formatDate(cert.issueDate)}</span>}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-signal hover:underline"
                    >
                      <span>ver credencial</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CTA final */}
      <Section className="border-t border-line pb-28">
        <div className="bracket-frame border border-line bg-paper/90 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              ¿Quieres revisar la versión en documento?
            </h2>
            <p className="mt-2 font-body text-sm text-ink-muted max-w-md">
              Descarga la hoja de vida actualizada con datos de contacto directo y resumen de tecnologías.
            </p>
          </div>
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs text-paper hover:bg-signal transition-colors flex-none"
          >
            <FileText size={14} />
            <span>ir a descarga de cv</span>
          </Link>
        </div>
      </Section>
    </div>
  );
}
