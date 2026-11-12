import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ScrollLine } from "@/components/motion/scroll-line";
import { PageHeader, SectionHeading } from "@/components/site/page-header";
import { getExperiences } from "@/lib/data/experiences-queries";
import { getEducation, getCertifications } from "@/lib/data/education-queries";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Experiencia Laboral, Formación & Credenciales",
  description:
    "Trayectoria profesional de Diego Alejandro Muñoz: desarrollo web, soporte operativo de datos, procesos y formación en Ingeniería de Sistemas.",
  path: "/experiencia",
});

function formatDate(value: string | null) {
  if (!value) return "Presente";
  const formatted = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function ExperienciaPage() {
  const [experiences, education, certifications] = await Promise.all([getExperiences(), getEducation(), getCertifications()]);

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Trayectoria & credenciales"
        title={
          <>
            Experiencia, formación <span className="font-serif">y método</span>
          </>
        }
        lede="Mi camino combina desarrollo web, soporte operativo de datos, gestión de procesos y formación en Ingeniería de Sistemas. La prioridad es mostrar experiencia real, proyectos verificables y aprendizajes conectados con tecnología."
        notes={[
          { label: "Cargos", value: String(experiences.length).padStart(2, "0") },
          { label: "Formación", value: String(education.length).padStart(2, "0") },
          { label: "Credenciales", value: String(certifications.length).padStart(2, "0") },
        ]}
        actions={
          <>
            <Link href="/cv" className={buttonVariants({ variant: "signal", size: "lg" })}>
              <FileText aria-hidden="true" size={15} />
              <span>Descargar CV en PDF</span>
            </Link>
            <Link href="/contacto" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <span>Contactar</span>
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </>
        }
      />

      {/* 1. Experiencia: línea de tiempo */}
      <section className="container-x border-t border-line py-24 sm:py-32">
        <SectionHeading
          index="01"
          eyebrow="Experiencia laboral"
          title={
            <>
              Historial <span className="font-serif">profesional</span>
            </>
          }
        />
        <ol className="relative mt-16 lg:ml-[25%]">
          <ScrollLine />
          {experiences.map((exp) => (
            <li key={exp.id} className="relative pb-16 pl-8 last:pb-0 sm:pl-12">
              <span aria-hidden="true" className="absolute left-0 top-2 h-2 w-2 -translate-x-[3.5px] bg-signal" />
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                  <span className="text-signal"> · {exp.company}</span>
                </p>
                <h3 className="display display-sm mt-4 text-ink">{exp.position}</h3>
                {exp.description && <p className="mt-5 max-w-[62ch] leading-relaxed text-ink-muted">{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-6 max-w-[62ch] space-y-2 border-t border-line pt-5">
                    {exp.achievements.map((ach) => (
                      <li key={ach} className="flex gap-3 text-sm leading-relaxed text-ink">
                        <span aria-hidden="true" className="font-mono text-signal">
                          +
                        </span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. Formación */}
      <section id="educacion" className="container-x scroll-mt-20 border-t border-line py-24 sm:py-32">
        <SectionHeading
          index="02"
          eyebrow="Formación académica"
          title={
            <>
              Educación técnica <span className="font-serif">y universitaria</span>
            </>
          }
        />
        <div className="mt-16 border-t border-line lg:ml-[25%]">
          {education.map((item) => (
            <Reveal key={item.id} className="grid grid-cols-1 gap-4 border-b border-line py-8 sm:grid-cols-12 sm:gap-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted sm:col-span-3">
                {formatDate(item.startDate)} — {formatDate(item.endDate)}
                {item.status && <span className="mt-2 block text-signal">{item.status}</span>}
              </p>
              <div className="sm:col-span-9">
                <h3 className="display text-[clamp(1.3rem,2.4vw,2.1rem)] leading-tight text-ink">{item.program}</h3>
                <p className="mt-2 font-serif text-xl italic text-ink-muted">{item.institution}</p>
                {item.description && <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-ink-muted">{item.description}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Certificaciones */}
      {certifications.length > 0 && (
        <section className="container-x border-t border-line py-24 sm:py-32">
          <SectionHeading
            index="03"
            eyebrow="Certificaciones & credenciales"
            title={
              <>
                Validación <span className="font-serif">de habilidades</span>
              </>
            }
          />
          <ul className="mt-16 border-t border-line lg:ml-[25%]">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line py-5">
                <div>
                  <h3 className="font-medium text-ink">{cert.name}</h3>
                  {cert.issuer && <p className="mt-1 text-sm text-ink-muted">{cert.issuer}</p>}
                </div>
                <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {cert.issueDate && <span>{formatDate(cert.issueDate)}</span>}
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="link-draw inline-flex items-center gap-1 text-ink">
                      Ver credencial <ArrowUpRight aria-hidden="true" size={12} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
