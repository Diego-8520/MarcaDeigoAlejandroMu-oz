import type { Metadata } from "next";
import { Section, Tag } from "@/components/ui/section";
import { readTechStack } from "@/lib/data/tech-stack";

export const metadata: Metadata = {
  title: "Arquitectura — Diego Alejandro Muñoz",
  description:
    "Cómo está construido diegoalejandromunoz.com: decisiones de arquitectura, datos, automatización y diseño.",
};

export default function ArquitecturaPage() {
  const stack = readTechStack();

  return (
    <div>
      <Section className="max-w-4xl pt-16 pb-14 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">arquitectura</p>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
          Cómo está construido este sitio
        </h1>
        <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
          Este portafolio también es un producto: tiene un dashboard privado,
          contenido gestionable, analítica propia y automatizaciones para
          reducir trabajo repetitivo. Aquí explico las decisiones que lo hacen
          funcionar.
        </p>

        <div className="bracket-frame mt-10 border border-line bg-white/40 p-5 font-mono text-xs leading-loose text-ink-muted sm:p-6">
          <p>
            <span className="text-signal">visitante</span> → Next.js App Router
          </p>
          <p className="pl-8">→ Supabase: Postgres · Auth · Storage</p>
          <p className="pl-16">
            → Server Actions · dashboard · analítica propia
          </p>
        </div>
      </Section>

      <Section className="border-t border-line">
        <p className="font-mono text-xs text-ink-muted">01 / stack</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Las piezas reales
        </h2>
        <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-ink-muted">
          Las versiones se leen directamente del package.json de este proyecto,
          por lo que esta lista refleja la instalación actual en cada build.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {stack.map((technology) => (
            <span
              key={technology.packageName}
              className="inline-flex items-center gap-2 border border-line px-2.5 py-1 font-mono text-xs text-ink"
            >
              <Tag>{technology.name}</Tag>
              <span className="text-ink-muted">{technology.version}</span>
            </span>
          ))}
        </div>
      </Section>

      <Section className="border-t border-line">
        <p className="font-mono text-xs text-ink-muted">
          02 / arquitectura de datos
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Contenido público, administración privada
        </h2>
        <div className="mt-5 max-w-2xl space-y-4 font-body text-sm leading-relaxed text-ink-muted">
          <p>
            Supabase concentra PostgreSQL, autenticación y Storage. Las tablas
            de contenido público tienen políticas RLS de lectura; los datos que
            no deben exponerse, como los contactos y los eventos de analítica,
            solo se consultan desde el servidor administrativo.
          </p>
          <p>
            Las escrituras del dashboard pasan por Server Actions que verifican
            la sesión y usan el cliente de administración en el servidor. Así el
            navegador nunca recibe credenciales privilegiadas y la interfaz
            pública solo obtiene los datos que sus políticas permiten leer.
          </p>
        </div>
      </Section>

      <Section className="border-t border-line">
        <p className="font-mono text-xs text-ink-muted">
          03 / automatizaciones
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Menos copiar y pegar
        </h2>
        <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-ink-muted">
          Al editar un proyecto, el dashboard puede consultar la metadata de su
          repositorio de GitHub y de su sitio en vivo. El título, la
          descripción, las tecnologías detectadas y la imagen Open Graph sirven
          como punto de partida para el contenido del proyecto, sin sustituir la
          revisión de Diego. Es una integración concreta de APIs para reducir
          trabajo manual.
        </p>
      </Section>

      <Section className="border-t border-line">
        <p className="font-mono text-xs text-ink-muted">
          04 / decisiones de diseño
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Una interfaz con intención
        </h2>
        <div className="mt-5 max-w-2xl space-y-4 font-body text-sm leading-relaxed text-ink-muted">
          <p>
            La paleta ink/paper/signal y los bordes finos hacen que el contenido
            sea el protagonista. Los bloques bracket-frame aparecen donde ayudan
            a agrupar una idea, no como decoración repetida ni como una
            colección de tarjetas genéricas.
          </p>
          <p>
            La tipografía tiene funciones distintas: Space Grotesk construye la
            jerarquía, IBM Plex Mono identifica datos, rutas y estados, y Work
            Sans mantiene cómoda la lectura de párrafos largos. Esa separación
            hace que un proyecto, un estado del dashboard y una explicación se
            perciban como cosas diferentes.
          </p>
          <p>
            Se evitó una plantilla de portafolio intercambiable. La interfaz
            comparte el lenguaje de una herramienta de trabajo porque el sitio
            demuestra el sistema que Diego también construiría para otra
            persona: contenido editable, estados claros y decisiones visibles.
          </p>
        </div>
      </Section>

      <Section className="border-t border-line pb-28">
        <p className="font-mono text-xs text-ink-muted">
          05 / analítica propia
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Medir sin entregar el dato principal
        </h2>
        <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-ink-muted">
          El dashboard registra page views, sesiones, proyectos vistos,
          descargas de CV y contactos en Supabase, y los agrupa por página,
          procedencia, país y dispositivo. El core del dato vive en el propio
          proyecto, sin depender de Google Analytics; Vercel Web Analytics se
          usa como complemento para Web Vitals y señales de rendimiento.
        </p>
      </Section>
    </div>
  );
}
