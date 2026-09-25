import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, ExternalLink, Mail, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CvDownloadLink } from "@/components/analytics/cv-download-link";
import { getVisibleCvDocuments } from "@/lib/data/cv-queries";
import { LinkedinIcon } from "@/components/ui/icons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hoja de Vida (CV) & Perfil Profesional",
  description:
    "Hoja de vida verificada de Diego Alejandro Muñoz: Desarrollador de Software en Next.js, React, TypeScript y C# .NET.",
};

const EXECUTIVE_HIGHLIGHTS = [
  "Estudiante de Ingeniería en Sistemas de Información (UNIAJC, Cali, Colombia).",
  "Experiencia técnica en normalización masiva de inventarios y datos XML/APIs en Juniper Travel Technology.",
  "Desarrollo de aplicaciones completas: Next.js (App Router), TypeScript, Supabase (PostgreSQL + RLS) y C# .NET.",
  "Sólida base en procesos, normatividad y control de riesgos heredada de formación tecnológica previa en SST.",
  "Disponibilidad para puestos remotos e híbridos de desarrollo frontend, backend o full-stack.",
];

export default async function CvPage() {
  const visibleDocuments = await getVisibleCvDocuments();
  const primaryCv = visibleDocuments[0] ?? null;
  const secondaryCvs = visibleDocuments.slice(1);

  return (
    <Section className="max-w-4xl pt-16 pb-24 lg:pt-24">
      <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        <span>DOCUMENTO VERIFICADO</span>
      </div>

      <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink">
        Hoja de vida & credenciales
      </h1>
      <p className="mt-4 max-w-xl font-body text-base text-ink-muted leading-relaxed">
        Perfil profesional actualizado de Diego Alejandro Muñoz. Acceso a visualización directa en navegador y descarga de documento PDF para reclutadores y líderes técnicos.
      </p>

      {/* Resumen ejecutivo en pantalla (Accesible de inmediato sin descargar) */}
      <div className="mt-10 border border-line bg-surface/70 p-6 sm:p-8 rounded-sm">
        <div className="flex items-center justify-between pb-4 border-b border-line/60">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Resumen Ejecutivo para Reclutadores
            </h2>
            <p className="font-mono text-xs text-ink-subtle mt-0.5">
              Cali, Colombia · diego_8520@outlook.com · +57 321 515 0904
            </p>
          </div>
          <Badge variant="live" dot>Activo</Badge>
        </div>

        <ul className="mt-5 space-y-2.5 font-body text-xs sm:text-sm text-ink-muted">
          {EXECUTIVE_HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-signal-light flex-none mt-0.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Acciones de descarga o fallback */}
        <div className="mt-8 pt-6 border-t border-line/60 flex flex-wrap items-center gap-4">
          {primaryCv ? (
            <>
              <CvDownloadLink
                href={primaryCv.downloadUrl}
                label="Descargar CV en PDF"
                cvId={primaryCv.id}
                variant="primary"
              />
              <a
                href={primaryCv.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-signal transition-colors py-2 px-3 border border-line rounded-sm"
              >
                <ExternalLink size={13} />
                <span>Abrir PDF en pestaña nueva</span>
              </a>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:diego_8520@outlook.com?subject=Solicitud%20de%20CV%20-%20Diego%20Mu%C3%B1oz"
                className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 font-mono text-xs hover:bg-signal transition-colors rounded-sm"
              >
                <Mail size={13} />
                <span>Solicitar copia directa por correo</span>
              </a>
              <a
                href="https://www.linkedin.com/in/dalejandromunoz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-line text-ink px-4 py-2 font-mono text-xs hover:border-signal hover:text-signal transition-colors rounded-sm"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>Ver perfil en LinkedIn</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Otras versiones disponibles si existen */}
      {secondaryCvs.length > 0 && (
        <div className="mt-10">
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-muted font-semibold">
            Otras versiones de documento
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {secondaryCvs.map((cv) => (
              <div
                key={cv.id}
                className="flex flex-col justify-between border border-line bg-surface/50 p-5 rounded-sm"
              >
                <div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <FileText className="h-4 w-4 text-signal-light" />
                    <span className="font-mono text-[11px]">PDF Oficial</span>
                  </div>
                  <h4 className="mt-2 font-display text-sm font-semibold text-ink">
                    {cv.label}
                  </h4>
                </div>

                <div className="mt-5 flex items-center gap-3 pt-3 border-t border-line/40">
                  <CvDownloadLink
                    href={cv.downloadUrl}
                    label="Descargar"
                    cvId={cv.id}
                    variant="secondary"
                  />
                  <a
                    href={cv.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted hover:text-signal"
                  >
                    <ExternalLink size={12} />
                    <span>Ver</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA final para recruiter */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="bracket-frame border border-line bg-surface/80 p-8 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">
              ¿Listo para agendar una entrevista técnica?
            </h3>
            <p className="mt-1 font-body text-xs sm:text-sm text-ink-muted max-w-md leading-relaxed">
              Escríbeme para coordinar una llamada o revisar requerimientos específicos de tu equipo.
            </p>
          </div>
          <Link href="/contacto?motivo=empleo">
            <Button variant="signal" size="md" rightIcon={<ArrowRight size={14} />}>
              Agendar o Contactar
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
