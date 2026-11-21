import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader, SectionHeading } from "@/components/site/page-header";
import { readTechStack } from "@/lib/data/tech-stack";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, graph } from "@/lib/schema";
import { NextSteps } from "@/components/site/next-steps";

export const metadata: Metadata = pageMetadata({
  title: "Arquitectura de este sitio",
  description:
    "Cómo está construido diegoalejandromunoz.com: Next.js 16, Supabase con RLS, panel administrativo privado, capturas automáticas de proyectos, integraciones con GitHub y Vercel, y despliegue en Vercel.",
  path: "/arquitectura",
});

type DiagramNode = { x: number; y: number; label: string; sub: string[]; tone?: "signal" | "muted"; small?: boolean };

const COL = [40, 290, 540, 790];
const W = 200;

/** Nodos del diagrama: fila pública, fila privada y servicios que solo llama el servidor. */
const NODES: DiagramNode[] = [
  { x: COL[0], y: 52, label: "Visitante", sub: ["navegador"] },
  { x: COL[1], y: 52, label: "Proxy", sub: ["sesión Supabase", "allowlist ADMIN_EMAILS"] },
  { x: COL[2], y: 52, label: "Next.js 16", sub: ["App Router · RSC", "ISR cada 60 s"] },
  { x: COL[3], y: 52, label: "Supabase", sub: ["Postgres · RLS · Auth", "Storage de imágenes"] },
  { x: COL[0], y: 252, label: "Diego", sub: ["email o Google", "único administrador"] },
  { x: COL[2], y: 252, label: "Dashboard", sub: ["Server Actions", "cliente admin en servidor"], tone: "signal" },
  { x: COL[0], y: 452, label: "GTM · GA4", sub: ["desde el navegador", "solo sitio público"], tone: "muted", small: true },
  { x: COL[1], y: 452, label: "GitHub · Vercel", sub: ["OAuth · token cifrado", "metadata · README"], tone: "muted", small: true },
  { x: COL[2], y: 452, label: "Chromium", sub: ["capturas automáticas", "escritorio · móvil"], tone: "muted", small: true },
  { x: COL[3], y: 452, label: "Empleo", sub: ["4 bolsas de vacantes", "agente en Claude Code"], tone: "muted", small: true },
];

const LANES = [
  { y: 30, label: "01 · sitio público" },
  { y: 230, label: "02 · panel privado" },
  { y: 430, label: "03 · servicios externos" },
];

/** Diagrama del flujo de datos. Las líneas discontinuas "fluyen" con una animación CSS. */
function FlowDiagram() {
  return (
    <figure className="overflow-x-auto border-y border-line py-10">
      <svg viewBox="0 0 1010 560" role="img" aria-labelledby="flow-title flow-desc" className="w-full min-w-[760px]">
        <title id="flow-title">Arquitectura de diegoalejandromunoz.com</title>
        <desc id="flow-desc">
          El visitante pasa por el proxy de Next.js, que refresca la sesión, y recibe páginas renderizadas en el servidor que leen
          Supabase con políticas RLS. Diego inicia sesión; el proxy solo deja pasar los correos de ADMIN_EMAILS al dashboard, cuyas
          Server Actions escriben en Supabase con el cliente de administración. Desde el servidor se llaman GitHub y Vercel, un
          Chromium que toma capturas de los proyectos y las fuentes del buscador de empleo. GA4 mide solo el sitio público.
        </desc>

        {LANES.map((lane) => (
          <g key={lane.label}>
            <text x={COL[0]} y={lane.y} fill="var(--ink-subtle)" fontFamily="var(--font-jetbrains-mono)" fontSize={10} letterSpacing="0.08em">
              {lane.label.toUpperCase()}
            </text>
            <line x1={COL[0] + 8 + lane.label.length * 6.6} y1={lane.y - 3} x2={COL[3] + W} y2={lane.y - 3} stroke="var(--line)" />
          </g>
        ))}

        {NODES.map((n) => {
          const signal = n.tone === "signal";
          const muted = n.tone === "muted";
          return (
            <g key={n.label}>
              <rect
                x={n.x}
                y={n.y}
                width={W}
                height={92}
                fill={signal || muted ? "none" : "var(--surface)"}
                stroke={signal ? "var(--signal)" : muted ? "var(--line)" : "var(--line-focus)"}
                strokeDasharray={signal ? "2 4" : undefined}
              />
              <text
                x={n.x + 16}
                y={n.y + 32}
                fill={signal ? "var(--signal)" : "var(--ink)"}
                fontFamily="var(--font-archivo)"
                fontWeight={800}
                fontSize={n.small ? 16 : 19}
                style={{ fontStretch: "125%" }}
              >
                {n.label.toUpperCase()}
              </text>
              {n.sub.map((line, i) => (
                <text key={line} x={n.x + 16} y={n.y + 56 + i * 16} fill="var(--ink-muted)" fontFamily="var(--font-jetbrains-mono)" fontSize={10.5}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Fila pública: visitante → proxy → Next.js → Supabase (lectura con RLS). */}
        <path d="M240 98 H290" className="flow-line" />
        <path d="M490 98 H540" className="flow-line" />
        <path d="M740 98 H790" className="flow-line" />
        {/* Visitante → GA4 por el margen izquierdo. */}
        <path d="M40 98 H20 V498 H40" className="flow-line" />
        {/* Diego → proxy (login) → dashboard. */}
        <path d="M240 298 H390 V144" className="flow-line" />
        <path d="M640 144 V252" className="flow-line" />
        {/* Dashboard → Supabase: escrituras con el cliente de administración. */}
        <path d="M740 298 H890 V144" className="flow-line flow-line--accent" />
        {/* Dashboard → servicios del servidor. */}
        <path d="M640 344 V398 H390 V452" className="flow-line" />
        <path d="M640 344 V452" className="flow-line" />
        <path d="M640 398 H890 V452" className="flow-line" />
      </svg>
      <figcaption className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] text-ink-muted">
        <span className="flex items-center gap-2">
          <svg width="28" height="6" aria-hidden="true"><path d="M0 3 H28" className="flow-line" /></svg>
          petición o lectura
        </span>
        <span className="flex items-center gap-2">
          <svg width="28" height="6" aria-hidden="true"><path d="M0 3 H28" className="flow-line flow-line--accent" /></svg>
          escritura con el cliente de administración (solo servidor)
        </span>
      </figcaption>
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
        lede="Este portafolio también es un producto: detrás de las páginas públicas hay un panel privado desde el que administro todo el contenido, integraciones con GitHub y Vercel, capturas automáticas de cada proyecto y un buscador de empleo propio. Aquí explico cómo encajan las piezas y por qué las elegí."
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
            "Supabase concentra PostgreSQL, autenticación y Storage. Las tablas de contenido público solo permiten leer lo que está publicado (RLS); los contactos, las integraciones y el buscador de empleo no tienen políticas públicas y únicamente se consultan desde el servidor.",
            "El acceso al panel tiene dos capas. El proxy de Next.js refresca la sesión en cada petición y solo deja pasar a /dashboard los correos incluidos en ADMIN_EMAILS: si alguien entra con otra cuenta, incluso de Google, cierra su sesión y lo devuelve al login. Después, cada Server Action vuelve a verificar la sesión antes de escribir con el cliente de administración, que vive solo en el servidor. El navegador nunca recibe credenciales privilegiadas.",
            "Las páginas públicas se renderizan en el servidor y se regeneran cada 60 segundos, así que un cambio hecho en el panel aparece en el sitio en menos de un minuto sin volver a desplegar.",
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
            "Al crear o editar un proyecto, el panel consulta su repositorio de GitHub (lenguajes, temas, estrellas, README) y su sitio en vivo. Con eso propone título, descripción, tecnologías y textos de problema y solución como punto de partida; la redacción final siempre la reviso yo.",
            "Cuando un proyecto tiene URL pública, el servidor abre el sitio con un Chromium propio (Puppeteer y @sparticuz/chromium en Vercel) y guarda en Storage una captura de escritorio, hasta cuatro secciones con su título y una vista móvil. Una guarda contra SSRF impide apuntarlo a direcciones internas, y las imágenes que subo a mano nunca se reemplazan.",
            "La conexión con GitHub usa OAuth con alcance mínimo y el token se guarda cifrado con AES-256-GCM. Junto con las APIs de Vercel y de gestión de Supabase alimenta un inventario de recursos externos: repositorios, despliegues y bases de datos, para saber qué está publicado y qué falta documentar.",
          ],
        },
        {
          index: "04",
          eyebrow: "Herramienta interna",
          title: (
            <>
              Un buscador de empleo <span className="font-serif">sin inventar nada</span>
            </>
          ),
          body: [
            "El panel incluye un buscador que reúne vacantes de Get on Board, Remotive, Adzuna y Jooble, o de ofertas pegadas a mano, y mide qué tan bien encajan con mi perfil usando reglas, sin IA y sin costo: puntaje con desglose, palabras clave presentes o faltantes y sugerencias para ajustar la hoja de vida.",
            "Para un análisis más profundo uso un agente en Claude Code que lee los datos reales del panel, evalúa la oferta y adapta la hoja de vida. Antes de guardar, un validador rechaza cualquier experiencia, cifra o habilidad que no tenga respaldo en los datos.",
          ],
        },
        {
          index: "05",
          eyebrow: "Decisiones de diseño",
          title: (
            <>
              Ingeniería <span className="font-serif">en tinta</span>
            </>
          ),
          body: [
            "La interfaz se plantea como una revista de diseño impresa por un ingeniero: la tipografía es la protagonista, las estructuras se marcan con reglas finas y la información técnica vive en notas al margen. No hay tarjetas genéricas ni gradientes decorativos.",
            "Tres familias con funciones distintas: Archivo, con su eje de ancho variable, construye titulares expandidos que se ensanchan al interactuar; Instrument Serif en cursiva aporta el contraste editorial; JetBrains Mono identifica datos, índices y estados. Un único color de acento, lima eléctrico, marca lo accionable y el estado activo sobre el negro tinta.",
            "El movimiento usa GSAP y Lenis para revelados y scroll horizontal, y las transiciones entre páginas usan la View Transitions API nativa. Todo respeta prefers-reduced-motion: sin animación, el contenido se muestra completo desde el servidor.",
          ],
        },
        {
          index: "06",
          eyebrow: "Medición",
          title: (
            <>
              Una sola fuente <span className="font-serif">de medición</span>
            </>
          ),
          body: [
            "El tráfico se mide en Google Analytics 4 a través de Google Tag Manager: visitas, descargas del CV y envíos del formulario de contacto llegan como eventos al dataLayer y se gestionan desde el contenedor, sin scripts duplicados en el código. GTM solo se carga en el sitio público; el panel y el login quedan fuera de la medición.",
            "Supabase conserva lo operativo: contactos, proyectos y contenido. El resumen del panel muestra esos conteos y enlaza a GA4 para el tráfico.",
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
      <NextSteps hrefs={["/proyectos","/sobre-mi","/contacto"]} />
    </>
  );
}
