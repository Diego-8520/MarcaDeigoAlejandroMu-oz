import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CvDownloadLink } from "@/components/analytics/cv-download-link";
import { LinkedinIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/site/page-header";
import { getVisibleCvDocuments } from "@/lib/data/cv-queries";
import { CONTACT } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, graph } from "@/lib/schema";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Hoja de vida (CV)",
  description:
    "Hoja de vida de Diego Alejandro Muñoz en PDF: desarrollador de software en Cali con foco en Next.js, React, TypeScript, Supabase y datos.",
  path: "/cv",
});

const EXECUTIVE_HIGHLIGHTS = [
  "Estudiante de Ingeniería de Sistemas (UNIAJC, Cali, Colombia).",
  "Experiencia en verificación de calidad, consistencia de inventario y soporte operativo de datos en Juniper Travel Technology.",
  "Desarrollo de aplicaciones web y paneles administrativos con Next.js (App Router), React, TypeScript y Supabase/PostgreSQL.",
  "Sólida base en procesos, normatividad y control de riesgos heredada de formación tecnológica previa en SST.",
  "Disponibilidad para roles junior remotos o híbridos en desarrollo web, backend inicial o soporte técnico orientado a datos.",
];

export default async function CvPage() {
  const visibleDocuments = await getVisibleCvDocuments();
  const primaryCv = visibleDocuments[0] ?? null;
  const secondaryCvs = visibleDocuments.slice(1);

  return (
    <>
      <JsonLd data={graph(breadcrumbNode([{ name: "Hoja de vida", path: "/cv" }]))} />
      <PageHeader
        index="06"
        eyebrow="Documento verificado"
        title={
          <>
            Hoja de vida <span className="font-serif">&amp; credenciales</span>
          </>
        }
        lede="Perfil profesional actualizado de Diego Alejandro Muñoz. Acceso a visualización directa en navegador y descarga de documento PDF para reclutadores y líderes técnicos."
        notes={[
          { label: "Ubicación", value: "Cali, Colombia" },
          { label: "Correo", value: CONTACT.email },
          { label: "Teléfono", value: CONTACT.phoneDisplay },
          {
            label: "Estado",
            value: (
              <span className="inline-flex items-center gap-2 text-emerald">
                <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald" />
                Activo
              </span>
            ),
          },
        ]}
      />

      {/* Documento: resumen ejecutivo como una hoja impresa */}
      <section className="container-x border-t border-line py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-3">
            <p className="eyebrow">Resumen ejecutivo para reclutadores</p>
          </div>
          <Reveal as="ol" stagger className="border-t border-line lg:col-span-9">
            {EXECUTIVE_HIGHLIGHTS.map((h, i) => (
              <li key={h} className="grid grid-cols-12 gap-4 border-b border-line py-6">
                <span className="col-span-2 font-mono text-xs text-signal sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-10 text-lg leading-relaxed text-ink sm:col-span-11">{h}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Descarga */}
      <section className="border-t border-line bg-surface">
        <div className="container-x py-16 sm:py-24">
          {primaryCv ? (
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-8">
                <p className="eyebrow">{primaryCv.label}</p>
                <CvDownloadLink
                  href={primaryCv.downloadUrl}
                  label="Descargar CV en PDF"
                  cvId={primaryCv.id}
                  variant="hero"
                  className="mt-6"
                />
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href={primaryCv.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-ink"
                >
                  Abrir PDF en pestaña nueva <ArrowUpRight aria-hidden="true" size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <p className="eyebrow">El documento se está actualizando</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Solicitud de CV - Diego Muñoz")}`}
                  className={buttonVariants({ variant: "signal", size: "lg" })}
                >
                  <Mail aria-hidden="true" size={15} />
                  <span>Solicitar copia por correo</span>
                </a>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  <LinkedinIcon className="h-4 w-4" />
                  <span>Ver perfil en LinkedIn</span>
                </a>
              </div>
            </div>
          )}

          {secondaryCvs.length > 0 && (
            <div className="mt-16 border-t border-line pt-8">
              <p className="eyebrow">Otras versiones de documento</p>
              <ul className="mt-6">
                {secondaryCvs.map((cv) => (
                  <li key={cv.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4">
                    <span className="text-ink">{cv.label}</span>
                    <span className="flex items-center gap-5">
                      <CvDownloadLink href={cv.downloadUrl} label="Descargar" cvId={cv.id} variant="secondary" />
                      <a
                        href={cv.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw font-mono text-xs uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
                      >
                        Ver
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-4">
            <h2 className="display display-sm text-ink">
              ¿Listo para agendar una <span className="font-serif">entrevista técnica?</span>
            </h2>
            <p className="mt-4 max-w-[56ch] text-ink-muted">
              Escríbeme para coordinar una llamada o revisar requerimientos específicos de tu equipo.
            </p>
          </div>
          <div className="lg:col-span-2 lg:justify-self-end">
            <Link href="/contacto?motivo=empleo" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <span>Agendar o contactar</span>
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
