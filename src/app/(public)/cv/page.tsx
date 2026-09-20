import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/section";
import { CvDownloadLink } from "@/components/analytics/cv-download-link";
import { getVisibleCvDocuments } from "@/lib/data/cv-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CV — Diego Alejandro Muñoz",
  description:
    "Hoja de vida y perfil profesional de Diego Alejandro Muñoz. Software engineer especializado en frontend, backend y automatizaciones.",
};

export default async function CvPage() {
  const visibleDocuments = await getVisibleCvDocuments();

  const primaryCv = visibleDocuments[0] ?? null;
  const secondaryCvs = visibleDocuments.slice(1);

  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">cv</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Hoja de vida
      </h1>
      <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
        Documentos actualizados con trayectoria profesional, capacidades técnicas y experiencia en desarrollo de software, arquitectura web e integraciones.
      </p>

      {visibleDocuments.length === 0 ? (
        <div className="mt-10 max-w-lg border border-line bg-paper/60 p-6 sm:p-8">
          <FileText className="h-6 w-6 text-ink-muted/70" />
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            CV disponible próximamente
          </h2>
          <p className="mt-2 font-body text-sm text-ink-muted leading-relaxed">
            Actualmente se está actualizando la versión descargable en formato PDF. Si necesitas una copia inmediata o deseas discutir una oportunidad, puedes ponerte en contacto directamente.
          </p>
          <div className="mt-6">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal"
            >
              <span>ir a contacto</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 space-y-10 max-w-2xl">
          {/* CV Principal */}
          {primaryCv && (
            <div className="border border-line bg-paper/60 p-6 sm:p-8">
              <div className="flex items-center gap-2 font-mono text-xs text-signal">
                <span className="h-2 w-2 rounded-full bg-signal" />
                <span>versión principal</span>
              </div>

              <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                {primaryCv.label}
              </h2>

              <p className="mt-2 font-mono text-xs text-ink-muted">
                Formato: PDF · Descarga directa verificada
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <CvDownloadLink
                  href={primaryCv.downloadUrl}
                  label="descargar cv (pdf)"
                  cvId={primaryCv.id}
                  variant="primary"
                />

                <a
                  href={primaryCv.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted hover:text-signal transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>abrir en el navegador</span>
                </a>
              </div>
            </div>
          )}

          {/* Versiones adicionales si existen */}
          {secondaryCvs.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                otras versiones disponibles
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {secondaryCvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="flex flex-col justify-between border border-line bg-paper/40 p-5"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-ink-muted">
                        <FileText className="h-4 w-4" />
                        <span className="font-mono text-[11px]">documento pdf</span>
                      </div>
                      <h4 className="mt-2 font-body text-sm font-medium text-ink">
                        {cv.label}
                      </h4>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <CvDownloadLink
                        href={cv.downloadUrl}
                        label="descargar"
                        cvId={cv.id}
                        variant="secondary"
                      />
                      <a
                        href={cv.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted hover:text-signal"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>ver</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
