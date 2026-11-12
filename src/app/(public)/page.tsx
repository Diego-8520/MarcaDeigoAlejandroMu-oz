import type { Metadata } from "next";
import Link from "next/link";
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/seo";
import { ArrowDown, ArrowRight } from "lucide-react";
import { getPublishedProjects } from "@/lib/data/projects-queries";
import { getExperiences } from "@/lib/data/experiences-queries";
import { getPublishedTestimonials } from "@/lib/data/testimonials-queries";
import { Reveal, SplitReveal } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { Counter } from "@/components/motion/counter";
import { ScrollLine } from "@/components/motion/scroll-line";
import { DotField } from "@/components/site/dot-field";
import { HeroCtas } from "@/components/site/hero-ctas";
import { WorkIndex } from "@/components/site/work-index";
import { SectionHeading } from "@/components/site/page-header";
import { CapabilitiesPin, type Capability } from "@/components/site/capabilities-pin";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { CaliClock } from "@/components/site/cali-clock";
import { JsonLd } from "@/components/seo/json-ld";
import { graph, personNode, profilePageNode } from "@/lib/schema";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

const CAPABILITIES: Capability[] = [
  {
    id: "fullstack",
    service: "aplicaciones-web",
    title: "Desarrollo Web & Paneles Administrativos",
    eyebrow: "Producto Funcional",
    description:
      "Aplicaciones web funcionales con Next.js, React y TypeScript, enfocadas en administrar contenido, publicar proyectos y resolver necesidades reales sin inflar el alcance.",
    deliverables: ["Sitios y paneles administrables", "Diseño responsivo", "Server Actions y validación", "Código tipado y mantenible"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "databases",
    service: "aplicaciones-web",
    title: "Bases de Datos & Persistencia Segura",
    eyebrow: "Supabase & RLS",
    description:
      "Estructuración de datos para proyectos web con Supabase/PostgreSQL, autenticación, políticas RLS y almacenamiento, priorizando seguridad básica y consistencia editorial.",
    deliverables: ["Tablas relacionales", "Políticas RLS", "Storage para archivos", "Datos administrables"],
    stack: ["Supabase", "PostgreSQL", "RLS", "Storage"],
  },
  {
    id: "integrations",
    service: "automatizacion-integraciones",
    title: "Integración de APIs y Automatización de Procesos",
    eyebrow: "REST & Operación",
    description:
      "Consumo de servicios REST, sincronización de datos y reducción de tareas manuales con herramientas simples, scripts e integraciones ajustadas al problema.",
    deliverables: ["Consumo de APIs externas", "Sincronización de datos", "Formularios y registros", "Documentación del flujo"],
    stack: ["APIs REST", "OpenRouteService", "Webhooks", "Node.js"],
  },
];

const MARQUEE_STACK = ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS", "APIs REST", "Node.js"];

export default async function HomePage() {
  const [projects, experiences, testimonials] = await Promise.all([
    getPublishedProjects(),
    getExperiences(),
    getPublishedTestimonials(3),
  ]);

  const featuredProjects = projects.filter((p) => p.featured);
  const showcaseProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);

  // Evidencia: cada tecnología enlazada a los proyectos donde se aplicó.
  const skillToProjects = new Map<string, { title: string; slug: string }[]>();
  for (const p of projects) {
    for (const tech of p.technologies) {
      const list = skillToProjects.get(tech) ?? [];
      if (!list.some((x) => x.slug === p.slug)) list.push({ title: p.title, slug: p.slug });
      skillToProjects.set(tech, list);
    }
  }
  const evidence = Array.from(skillToProjects.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 9);

  const totalStars = projects.reduce((acc, p) => acc + (p.githubMetadata?.stars ?? 0), 0);
  // Cargo vigente (sin fecha de fin); si no hay, el más reciente.
  const currentJob = experiences.find((e) => !e.endDate) ?? experiences[0];
  const jobPeriod = currentJob
    ? `${currentJob.startDate.slice(0, 4)} — ${currentJob.endDate ? currentJob.endDate.slice(0, 4) : "Presente"}`
    : "";

  return (
    <>
      <JsonLd data={graph(personNode(), profilePageNode("/", HOME_TITLE))} />
      {/* 1. HERO */}
      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
        <DotField className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" />

        <div className="container-x relative flex flex-1 flex-col justify-between pb-10 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
          <Reveal immediate stagger as="dl" className="grid grid-cols-2 gap-x-6 gap-y-4 font-mono text-[11px] uppercase tracking-[0.08em] sm:grid-cols-4">
            <div>
              <dt className="text-ink-subtle">Rol</dt>
              <dd className="mt-1 text-ink">Software Developer</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Base</dt>
              <dd className="mt-1 text-ink">Cali, Colombia</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Hora local</dt>
              <dd className="mt-1 text-ink">
                <CaliClock />
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Estado</dt>
              <dd className="mt-1 flex items-center gap-2 text-emerald">
                <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald" />
                Inmediata / Remoto
              </dd>
            </div>
          </Reveal>

          {/*
            Un solo H1 con nombre y rol. En escritorio la fila del rol usa subgrid
            para que la entradilla (fuera del H1) quede a la derecha como antes.
            Dentro del H1 solo hay <span> (contenido en línea) y espacios
            explícitos entre bloques para que el texto no se lea pegado.
          */}
          <div className="mt-16 flex flex-col sm:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-6">
            <h1 className="lg:col-span-12 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:grid lg:grid-cols-subgrid lg:grid-rows-subgrid">
              <SplitReveal as="span" immediate delay={0.15} className="display display-xl block text-ink lg:col-span-12">
                <span className="block">Diego</span>{" "}
                <span className="block">Alejandro</span>{" "}
                <span className="block">
                  Muñoz<span className="text-signal">.</span>
                </span>
              </SplitReveal>{" "}
              <span className="mt-10 block border-t border-line pt-8 lg:col-span-12 lg:grid lg:grid-cols-subgrid">
                <Reveal as="span" immediate delay={0.55} className="block lg:col-span-5">
                  <span className="block font-serif text-[clamp(1.7rem,2.8vw,2.6rem)] italic leading-[1.1] text-ink">
                    Desarrollador de software <span className="text-signal">·</span> Next.js y TypeScript
                  </span>
                </Reveal>
              </span>
            </h1>
            <Reveal immediate delay={0.65} className="mt-8 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mt-10 lg:border-t lg:border-transparent lg:pt-8">
              <p className="lede max-w-[54ch]">
                Estudiante de Ingeniería de Sistemas (UNIAJC). Desarrollo aplicaciones web funcionales, paneles administrativos y
                herramientas con Next.js, React, TypeScript y PostgreSQL, respaldadas por criterio práctico en consistencia de datos y
                procesos operativos.
              </p>
              <div className="mt-8">
                <HeroCtas />
              </div>
            </Reveal>
          </div>

          <div className="mt-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
            <span className="flex items-center gap-2">
              <ArrowDown aria-hidden="true" size={12} className="animate-bounce" />
              Desplázate
            </span>
            <span className="hidden sm:inline">Portafolio · Edición {new Date().getFullYear()}</span>
          </div>
        </div>
      </section>

      {/* Cinta de stack */}
      <Marquee items={MARQUEE_STACK} />

      {/* 2. TRABAJO SELECCIONADO */}
      <section id="proyectos" className="container-x py-24 sm:py-32">
        <SectionHeading
          index="01"
          eyebrow="Trabajo real y comprobable"
          title={
            <>
              Proyectos <span className="font-serif">destacados</span>
            </>
          }
          aside={
            <p className="lede max-w-[60ch]">
              Cada proyecto muestra evidencia concreta: análisis de riesgo geoespacial, catálogos e-commerce con Supabase, landing pages,
              paneles administrativos y código disponible para revisión.
            </p>
          }
        />
        <div className="mt-16">
          <WorkIndex projects={showcaseProjects} />
        </div>
        <div className="mt-10 flex justify-end">
          <Link href="/proyectos" className="tap group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-ink">
            <span className="link-draw">Ver catálogo completo ({projects.length})</span>
            <ArrowRight aria-hidden="true" size={14} className="text-signal transition-transform duration-500 ease-expo group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* 3. CIFRAS */}
      <section aria-label="Cifras" className="border-y border-line">
        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {[
            { value: <Counter value={projects.length} />, label: "Proyectos en catálogo" },
            { value: <Counter value={100} suffix="%" />, label: "Código tipado & repos" },
            { value: totalStars > 0 ? <Counter value={totalStars} suffix="+" /> : "Open", label: "Stars & open source" },
            { value: "UNIAJC", label: "Ingeniería de Sistemas" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-col justify-between gap-10 bg-paper px-[var(--gutter)] py-10 sm:py-14"
            >
              <dt className="eyebrow order-2">{stat.label}</dt>
              <dd className="display order-1 text-[clamp(1.6rem,4.4vw,4.75rem)] text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 4. CAPACIDADES (scroll horizontal anclado) */}
      <section className="py-24 sm:py-32 lg:py-0">
        <CapabilitiesPin items={CAPABILITIES} />
      </section>

      {/* 5. STACK CON EVIDENCIA */}
      {evidence.length > 0 && (
        <section className="container-x border-t border-line py-24 sm:py-32">
          <SectionHeading
            index="04"
            eyebrow="Evidencia de habilidades"
            title={
              <>
                Stack con respaldo <span className="font-serif">en código</span>
              </>
            }
            aside={
              <p className="lede max-w-[60ch]">
                No muestro habilidades como una lista aislada sin evidencia. Cada tecnología clave está vinculada a los proyectos reales donde
                se implementó.
              </p>
            }
          />
          <Reveal as="ul" stagger className="mt-16 border-t border-line">
            {evidence.map(([tech, techProjects]) => (
              <li key={tech} className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 border-b border-line py-5 transition-colors hover:bg-surface sm:py-6">
                <span className="display stretch-hover col-span-12 text-[clamp(1.5rem,3vw,2.75rem)] text-ink transition-colors group-hover:text-signal sm:col-span-5">
                  {tech}
                </span>
                <span className="col-span-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle sm:col-span-2">
                  {techProjects.length} {techProjects.length === 1 ? "proyecto" : "proyectos"}
                </span>
                <span className="col-span-9 flex flex-wrap gap-x-4 gap-y-1 text-sm sm:col-span-5">
                  {techProjects.map((p) => (
                    <Link key={p.slug} href={`/proyectos/${p.slug}`} className="link-draw tap text-ink-muted hover:text-ink">
                      {p.title}
                    </Link>
                  ))}
                </span>
              </li>
            ))}
          </Reveal>
        </section>
      )}

      {/* 6. TRAYECTORIA */}
      <section className="container-x border-t border-line py-24 sm:py-32">
        <SectionHeading
          index="05"
          eyebrow="Rigor operativo & formación"
          title={
            <>
              Trayectoria <span className="font-serif">profesional</span>
            </>
          }
        />
        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-6">
          <Reveal className="relative pl-8 lg:col-span-5 lg:col-start-4">
            <ScrollLine />
            <p className="eyebrow text-signal">Experiencia técnica actual</p>
            <h3 className="display mt-4 text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[0.95] text-ink">
              {currentJob?.position ?? "Experiencia en actualización"}
            </h3>
            {currentJob && (
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.06em] text-ink-muted">
                {currentJob.company} · {jobPeriod}
              </p>
            )}
            {currentJob?.description && (
              <p className="mt-6 max-w-[52ch] leading-relaxed text-ink-muted line-clamp-5">{currentJob.description}</p>
            )}
          </Reveal>
          <Reveal delay={0.1} className="relative pl-8 lg:col-span-4">
            <ScrollLine />
            <p className="eyebrow text-signal">Formación universitaria</p>
            <h3 className="display mt-4 text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[0.95] text-ink">
              Ingeniería en Sistemas de Información
            </h3>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.06em] text-ink-muted">UNIAJC · 2024 — 2029</p>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-ink-muted">
              Formación en algoritmos, estructuras de datos, arquitectura de software y bases de datos relacionales. Complementado con
              titulación tecnológica previa en SST (SENA).
            </p>
          </Reveal>
        </div>
        <div className="mt-14 flex justify-end">
          <Link href="/experiencia" className="tap group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-ink">
            <span className="link-draw">Ver trayectoria completa</span>
            <ArrowRight aria-hidden="true" size={14} className="text-signal transition-transform duration-500 ease-expo group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* 7. TESTIMONIOS */}
      {testimonials.length > 0 && (
        <section className="container-x border-t border-line py-24 sm:py-32">
          <div className="mb-12 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
            <span className="text-signal">06</span>
            <span className="text-ink-muted">Confirmación de clientes</span>
          </div>
          <TestimonialCarousel items={testimonials} />
        </section>
      )}
    </>
  );
}
