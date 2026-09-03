import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Tag } from "@/components/ui/section";
import { ProjectCard } from "@/components/projects/project-card";
import { projects, services } from "@/lib/data/projects";

const CAPABILITIES = [
  "$ construyendo con next.js + typescript",
  "$ integrando agentes de ia con rag",
  "$ automatizando flujos con n8n",
  "$ administrando datos en postgresql",
];

export default function HomePage() {
  const featured = projects.filter((p) => p.featured);

  return (
    <div>
      {/* HERO */}
      <Section className="max-w-4xl pt-16 pb-16 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">
          software engineer · ai · automation
        </p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
          Construyo productos digitales, soluciones con IA y automatizaciones
          que resuelven problemas reales.
        </h1>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-muted">
          Soy Diego Alejandro Muñoz. Diseño y construyo sistemas completos —
          desde la base de datos hasta la interfaz — con foco en IA aplicada
          y automatización de procesos.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/proyectos"
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal"
          >
            ver proyectos
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-ink"
          >
            hablemos de tu proyecto
          </Link>
        </div>

        {/* Panel de estado — único momento de animación orquestado */}
        <div className="bracket-frame mt-14 max-w-md border border-line bg-white/40 p-5">
          <p className="font-mono text-[11px] text-ink-muted">estado actual</p>
          <div className="mt-3 space-y-1.5">
            {CAPABILITIES.map((line, i) => (
              <p key={line} className="font-mono text-[13px] text-ink">
                {line}
                {i === CAPABILITIES.length - 1 && (
                  <span className="cursor-blink ml-0.5 text-signal">▍</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* PROYECTOS DESTACADOS */}
      <Section className="border-t border-line">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Proyectos seleccionados
          </h2>
          <Link
            href="/proyectos"
            className="font-mono text-xs text-ink-muted hover:text-signal"
          >
            ver todos →
          </Link>
        </div>
        <div className="mt-6">
          {featured.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </Section>

      {/* SERVICIOS */}
      <Section className="border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Cómo puedo ayudarte
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {services.map((service) => (
            <div key={service.slug} className="bracket-frame p-4">
              <h3 className="font-display text-base font-semibold text-ink">
                {service.name}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
                {service.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {service.technologies.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PROCESO — numeración legítima: es una secuencia real */}
      <Section className="border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Cómo trabajo
        </h2>
        <ol className="mt-6 space-y-6">
          {[
            ["Entender el problema", "Antes de escribir código, entiendo qué decisión de negocio o necesidad real hay detrás."],
            ["Proponer una arquitectura", "Defino stack, modelo de datos y alcance antes de construir."],
            ["Construir e iterar", "Entrego en incrementos, con revisiones y ambientes de prueba (Vercel Preview)."],
            ["Desplegar y medir", "Publico en producción y dejo instrumentación para saber si está funcionando."],
          ].map(([title, desc], i) => (
            <li key={title} className="flex gap-4">
              <span className="font-mono text-sm text-ink-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-ink-muted">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* CTA FINAL */}
      <Section className="border-t border-line pb-28">
        <div className="bracket-frame border border-line p-8 sm:p-10">
          <h2 className="max-w-md font-display text-2xl font-semibold text-ink">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-ink-muted">
            Cuéntame qué necesitas y te respondo con una propuesta concreta,
            no una plantilla genérica.
          </p>
          <Link
            href="/contacto"
            className="mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal"
          >
            iniciar conversación
            <ArrowRight size={15} />
          </Link>
        </div>
      </Section>
    </div>
  );
}
