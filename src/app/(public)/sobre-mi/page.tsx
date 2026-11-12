import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { ProfileLinkIcon } from "@/components/profile/profile-link-icon";
import { Reveal, SplitReveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/page-header";
import { getProfile, getProfileLinks } from "@/lib/data/profile-queries";
import { getSkills } from "@/lib/data/skills-queries";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Sobre mí y forma de trabajar",
  description:
    "De la gestión de procesos y datos operativos al desarrollo de software con Next.js, React, TypeScript y Supabase: historia, principios y stack.",
  path: "/sobre-mi",
});

const PILLARS = [
  {
    title: "Rigor en Datos",
    body: "Persistencia con Supabase/PostgreSQL, tipado con TypeScript y validación de datos en proyectos propios.",
  },
  {
    title: "Pragmatismo Técnico",
    body: "Soluciones diseñadas para resolver el problema real sin caer en modas pasajeras ni sobreingeniería innecesaria.",
  },
  {
    title: "Evolución Continua",
    body: "Formación universitaria activa, proyectos propios en producción y aprendizaje gradual en automatización e integración de herramientas.",
  },
];

export default async function SobreMiPage() {
  const [profile, links, skills] = await Promise.all([getProfile(), getProfileLinks(), getSkills()]);

  const fullName = profile?.fullName ?? "Diego Alejandro Muñoz Arcos";
  const skillGroups = skills.reduce<Record<string, typeof skills>>((groups, skill) => {
    const category = skill.category ?? "Tecnologías";
    (groups[category] ??= []).push(skill);
    return groups;
  }, {});

  return (
    <>
      {/* Cabecera con retrato */}
      <header className="container-x pb-20 pt-[calc(var(--header-h)+3.5rem)] sm:pt-[calc(var(--header-h)+6rem)]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <Reveal immediate className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
              <span className="text-signal">05</span>
              <span aria-hidden="true" className="h-px w-10 bg-line-focus" />
              <span className="text-ink-muted">Perfil profesional & principios</span>
            </Reveal>
            <SplitReveal as="h1" immediate className="display display-lg mt-10 text-ink">
              {fullName}
            </SplitReveal>
            <Reveal immediate delay={0.35}>
              <p className="mt-8 font-serif text-[clamp(1.5rem,2.4vw,2.2rem)] italic leading-tight text-signal">
                Software Developer · Next.js &amp; TypeScript · Cali, Colombia
              </p>
              <p className="lede mt-6 max-w-[56ch]">
                Estudiante de Ingeniería de Sistemas en la UNIAJC. Construyo aplicaciones web funcionales, paneles administrativos e
                integraciones con Next.js, React, TypeScript y Supabase/PostgreSQL.
              </p>
            </Reveal>
          </div>

          {profile?.avatarUrl && (
            <Reveal immediate delay={0.2} y={60} className="lg:col-span-4 lg:self-end">
              <figure className="group relative aspect-[4/5] w-full max-w-sm overflow-hidden border border-line bg-surface lg:ml-auto">
                <Image
                  src={profile.avatarUrl}
                  alt={`Fotografía de ${fullName}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover grayscale transition-[filter,transform] duration-1000 ease-expo group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-paper/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted backdrop-blur-sm">
                  <span>Fig. 01</span>
                  <span>Cali, CO</span>
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>

        {links.length > 0 && (
          <nav aria-label="Redes y enlaces verificados" className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
              >
                <ProfileLinkIcon name={link.icon} size={14} />
                <span className="link-draw">{link.label}</span>
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Historia */}
      <section className="container-x border-t border-line py-24 sm:py-32">
        <SectionHeading
          index="01"
          eyebrow="La historia"
          title={
            <>
              De la gestión de procesos <span className="font-serif">al desarrollo de software</span>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12">
          <Reveal className="prose-editorial space-y-6 text-lg leading-relaxed text-ink-muted lg:col-span-7 lg:col-start-4">
            <p className="dropcap text-ink">
              Mi trayectoria profesional comenzó en el área de Seguridad y Salud en el Trabajo (SST). En ese entorno, la atención
              rigurosa a las normas, el análisis metódico de matrices de riesgos y el control estricto de procedimientos no son opcionales:
              son la diferencia entre un ambiente seguro y una contingencia grave.
            </p>
            <p>
              Esa disciplina estructurada fue la base con la que redirigí mi vocación hacia la ingeniería y la tecnología. Descubrí que
              construir software también exige entender procesos, modelar información con cuidado, validar entradas y crear sistemas que
              respondan a necesidades concretas.
            </p>
            <p>
              Actualmente curso Ingeniería de Sistemas en la Institución Universitaria Antonio José Camacho (UNIAJC) y trabajo como Mapping
              Agent / Soporte Operativo de Datos en Juniper Travel Technology, donde verifico calidad, consistencia de inventario y
              discrepancias en información hotelera y turística.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principios: lista numerada, no tarjetas */}
      <section className="container-x border-t border-line py-24 sm:py-32">
        <SectionHeading
          index="02"
          eyebrow="Pilares de trabajo"
          title={
            <>
              Cómo <span className="font-serif">trabajo</span>
            </>
          }
        />
        <ol className="mt-14 border-t border-line lg:ml-[25%]">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} className="group grid grid-cols-12 items-baseline gap-4 border-b border-line py-8">
              <span className="col-span-2 font-mono text-xs text-signal sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display stretch-hover col-span-10 text-[clamp(1.6rem,3.4vw,3rem)] leading-none text-ink sm:col-span-5">
                {p.title}
              </h3>
              <p className="col-span-12 leading-relaxed text-ink-muted sm:col-span-6">{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Stack comprobado: nube tipográfica por categoría */}
      {Object.keys(skillGroups).length > 0 && (
        <section className="container-x border-t border-line py-24 sm:py-32">
          <SectionHeading
            index="03"
            eyebrow="Tecnologías aplicadas en proyectos propios, repositorios y plataformas en vivo"
            title={
              <>
                Stack y herramientas <span className="font-serif">comprobadas</span>
              </>
            }
          />
          <div className="mt-14 space-y-12 lg:ml-[25%]">
            {Object.entries(skillGroups).map(([category, categorySkills]) => (
              <Reveal key={category} className="border-t border-line pt-6">
                <p className="eyebrow text-signal">{category}</p>
                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                  {categorySkills.map((skill, i) => (
                    <span key={skill.id} className="display text-[clamp(1.4rem,2.8vw,2.6rem)] text-ink">
                      {skill.name}
                      {i < categorySkills.length - 1 && (
                        <span aria-hidden="true" className="font-serif text-ink-subtle">
                          ,
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
