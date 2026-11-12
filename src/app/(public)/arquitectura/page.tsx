import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader, SectionHeading } from "@/components/site/page-header";
import { readTechStack } from "@/lib/data/tech-stack";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, graph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Arquitectura de este sitio",
  description:
    "Cómo está construido diegoalejandromunoz.com: Next.js, Supabase, páginas estáticas con revalidación, panel administrativo y despliegue en Vercel.",
  path: "/arquitectura",
});

/** Diagrama del flujo de datos. Las líneas discontinuas "fluyen" con una animación CSS. */
function FlowDiagram() {
  const nodes = [
    { x: 20, label: "Visitante", sub: "navegador" },
    { x: 270, label: "Next.js 16", sub: "App Router · RSC" },
    { x: 520, label: "Supabase", sub: "Postgres · Auth · Storage" },
  ];
  return (
    <figure className="overflow-x-auto border-y border-line py-10">
      <svg viewBox="0 0 760 260" role="img" aria-labelledby="flow-title" className="min-w-[640px] w-full">
        <title id="flow-title">Flujo: visitante hacia Next.js App Router hacia Supabase; el dashboard escribe mediante Server Actions.</title>
        {nodes.map((n) => (
          <g key={n.label}>
            <rect x={n.x} y={40} width={220} height={80} fill="var(--surface)" stroke="var(--line-focus)" />
            <text x={n.x + 16} y={74} fill="var(--ink)" fontFamily="var(--font-archivo)" fontWeight={800} fontSize={20} style={{ fontStretch: "125%" }}>
              {n.label.toUpperCase()}
            </text>
            <text x={n.x + 16} y={100} fill="var(--ink-muted)" fontFamily="var(--font-jetbrains-mono)" fontSize={11}>
              {n.sub}
            </text>
          </g>
        ))}
        <path d="M240 80 H270" className="flow-line" />
        <path d="M490 80 H520" className="flow-line" />
        {/* Ruta privada: dashboard → Server Actions → Supabase */}
        <rect x={270} y={170} width={220} height={60} fill="none" stroke="var(--signal)" strokeDasharray="2 4" />
        <text x={286} y={198} fill="var(--signal)" fontFamily="var(--font-jetbrains-mono)" fontSize={12}>
          dashboard · Server Actions
        </text>
        <text x={286} y={216} fill="var(--ink-muted)" fontFamily="var(--font-jetbrains-mono)" fontSize={10}>
          sesión verificada · cliente admin
        </text>
        <path d="M380 120 V170" className="flow-line" />
        <path d="M490 200 H630 V120" className="flow-line flow-line--accent" />
      </svg>
    </figure>
  );
}

export default function ArquitecturaPage() {
  const stack = readTechStack();

  return (
    <>
      <JsonLd data={graph(breadcrumbNode([{ name: "Arquitectura", path: "/arquitectura" }]))} />
      <PageHeader
        index="07"
        eyebrow="Arquitectura"
        title={
          <>
            Cómo está construido <span className="font-serif">este sitio</span>
          </>
        }
        lede="Este portafolio también es un producto: tiene un dashboard privado, contenido gestionable, analítica propia y automatizaciones para reducir trabajo repetitivo. Aquí explico las decisiones que lo hacen funcionar."
      />

      <section className="container-x pb-8">
        <FlowDiagram />
      </section>

      <section className="container-x py-24 sm:py-32">
        <SectionHeading
          index="01"
          eyebrow="Stack"
          title={
            <>
              Las piezas <span className="font-serif">reales</span>
            </>
          }
          aside={
            <p className="lede max-w-[60ch]">
              Las versiones se leen directamente del package.json de este proyecto, por lo que esta lista refleja la instalación actual en
              cada build.
            </p>
          }
        />
        <Reveal as="ul" stagger className="mt-14 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:ml-[25%] lg:grid-cols-3">
          {stack.map((technology) => (
            <li key={technology.packageName} className="flex items-baseline justify-between gap-4 border-b border-line py-4 sm:pr-6">
              <span className="text-ink">{technology.name}</span>
              <span className="font-mono text-xs text-signal">{technology.version}</span>
            </li>
          ))}
        </Reveal>
      </section>

      {[
        {
          index: "02",
          eyebrow: "Arquitectura de datos",
          title: (
            <>
              Contenido público, <span className="font-serif">administración privada</span>
            </>
          ),
          body: [
            "Supabase concentra PostgreSQL, autenticación y Storage. Las tablas de contenido público tienen políticas RLS de lectura; los datos que no deben exponerse, como los contactos y los eventos de analítica, solo se consultan desde el servidor administrativo.",
            "Las escrituras del dashboard pasan por Server Actions que verifican la sesión y usan el cliente de administración en el servidor. Así el navegador nunca recibe credenciales privilegiadas y la interfaz pública solo obtiene los datos que sus políticas permiten leer.",
          ],
        },
        {
          index: "03",
          eyebrow: "Automatizaciones",
          title: (
            <>
              Menos copiar <span className="font-serif">y pegar</span>
            </>
          ),
          body: [
            "Al editar un proyecto, el dashboard puede consultar la metadata de su repositorio de GitHub y de su sitio en vivo. El título, la descripción, las tecnologías detectadas y la imagen Open Graph sirven como punto de partida para el contenido del proyecto, sin sustituir la revisión de Diego. Es una integración concreta de APIs para reducir trabajo manual.",
          ],
        },
        {
          index: "04",
          eyebrow: "Decisiones de diseño",
          title: (
            <>
              Ingeniería <span className="font-serif">en tinta</span>
            </>
          ),
          body: [
            "La interfaz se plantea como una revista de diseño impresa por un ingeniero: la tipografía es la protagonista, las estructuras se marcan con reglas finas y la información técnica vive en notas al margen. No hay tarjetas genéricas ni gradientes decorativos.",
            "Tres familias con funciones distintas: Archivo, con su eje de ancho variable, construye titulares expandidos que se ensanchan al interactuar; Instrument Serif en cursiva aporta el contraste editorial; JetBrains Mono identifica datos, índices y estados. El color de acento cambia según quién visita: lima para empresas, naranja para clientes.",
            "El movimiento usa GSAP y Lenis para revelados y scroll horizontal, y las transiciones entre páginas usan la View Transitions API nativa. Todo respeta prefers-reduced-motion: sin animación, el contenido se muestra completo desde el servidor.",
          ],
        },
        {
          index: "05",
          eyebrow: "Medición",
          title: (
            <>
              Una sola fuente <span className="font-serif">de medición</span>
            </>
          ),
          body: [
            "La medición se centraliza en Google Analytics 4 a través de Google Tag Manager: page views, descargas de CV y envíos del formulario de contacto llegan como eventos al dataLayer y se gestionan desde el contenedor, sin scripts duplicados en el código. Supabase conserva lo operativo: contactos, proyectos y contenido del sitio.",
          ],
        },
      ].map((block) => (
        <section key={block.index} className="container-x border-t border-line py-24 sm:py-32">
          <SectionHeading index={block.index} eyebrow={block.eyebrow} title={block.title} />
          <Reveal className="prose-editorial mt-12 space-y-5 text-lg leading-relaxed text-ink-muted lg:ml-[25%]">
            {block.body.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </Reveal>
        </section>
      ))}
    </>
  );
}
