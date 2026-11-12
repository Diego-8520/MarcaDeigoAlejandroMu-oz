import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, MessageSquare, Plus } from "lucide-react";
import { Tag } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SplitReveal } from "@/components/motion/reveal";
import { PageHeader, SectionHeading } from "@/components/site/page-header";
import { CONTACT } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbNode, graph, personRef, serviceNodes } from "@/lib/schema";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Desarrollo web a medida en Cali",
  description:
    "Aplicaciones web y paneles administrativos, landing pages y automatización con APIs para negocios en Cali o en remoto, con alcance y entregables claros.",
  path: "/servicios",
});

const SERVICES = [
  {
    slug: "aplicaciones-web",
    name: "Desarrollo Web y Paneles Administrativos",
    badge: "Web Apps",
    summary:
      "Construyo aplicaciones web funcionales, paneles privados y flujos de administración de contenido con tecnologías modernas.",
    problem:
      "Necesitas un sistema propio para tu negocio (catálogo interactivo, panel de administración, intranet o portal de clientes) pero las herramientas genéricas no se ajustan a tus reglas de negocio.",
    solution:
      "Desarrollo interfaces en Next.js/React con Server Actions, validación tipada y persistencia en Supabase/PostgreSQL, cuidando autenticación, permisos y una experiencia clara para el usuario.",
    deliverables: [
      "Aplicación web responsiva desplegada en Vercel",
      "Base de datos PostgreSQL estructurada con reglas de seguridad RLS",
      "Panel de administración privado para gestionar tu contenido o datos",
      "Código fuente completo, tipado en TypeScript y documentado",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL"],
  },
  {
    slug: "landing-pages-conversion",
    name: "Landing Pages y Sitios Comerciales",
    badge: "Frontend & SEO",
    summary: "Páginas comerciales y sitios corporativos enfocados en velocidad, claridad de propuesta y captación de contactos.",
    problem: "Tu sitio web actual tarda en cargar, se ve mal en teléfonos móviles o recibe visitas pero nadie te contacta ni compra.",
    solution:
      "Diseño e implemento páginas de aterrizaje livianas y persuasivas con entrega estática (Next.js, Vite o Astro) que cargan al instante y facilitan el contacto directo por WhatsApp o formulario.",
    deliverables: [
      "Entrega estática optimizada para carga rápida",
      "Formularios de contacto integrados y notificaciones directas",
      "Estructura semántica preparada para SEO básico",
      "Diseño adaptable y fluido probado en múltiples dispositivos",
    ],
    technologies: ["React", "Vite", "Astro", "Tailwind CSS", "HTML5 Semántico", "Analytics anónimo"],
  },
  {
    slug: "automatizacion-integraciones",
    name: "Integración de APIs y Automatización de Procesos",
    badge: "Integraciones",
    summary: "Conecto servicios, formularios y bases de datos para reducir tareas manuales y mantener información más consistente.",
    problem: "Tu equipo pierde horas diarias copiando datos entre hojas de cálculo, sistemas de inventario, correos y plataformas externas.",
    solution:
      "Implemento integraciones con APIs REST, webhooks y scripts de apoyo para mover datos entre herramientas, registrar eventos y disparar notificaciones operativas.",
    deliverables: [
      "Integración estable entre sistemas mediante APIs y webhooks",
      "Normalización y limpieza automática de datos",
      "Manejo básico de errores y alertas ante fallos de sincronización",
      "Guía clara de funcionamiento y mantenimiento",
    ],
    technologies: ["APIs REST", "Webhooks", "Node.js", "SQL", "OpenRouteService", "Postman"],
  },
];

const FAQS = [
  {
    q: "¿Cómo calculas el presupuesto de un proyecto?",
    a: "Trabajo por alcance cerrado o hitos entregables. Tras una primera reunión o mensaje donde me cuentas tu necesidad, elaboro una propuesta con alcance técnico delimitado, cronograma y precio fijo, sin costos ocultos.",
  },
  {
    q: "¿Qué necesito para empezar a trabajar contigo?",
    a: "Una idea clara del problema que quieres resolver y el contenido base (textos, logos o datos de referencia si los tienes). Yo me encargo de orientar la arquitectura técnica y la ejecución.",
  },
  {
    q: "¿Cómo se realizan los pagos?",
    a: "Usualmente divido el proyecto en dos o tres partes: un anticipo inicial para iniciar el desarrollo, y pagos contra entrega de hitos verificables en entornos de prueba antes del despliegue final.",
  },
  {
    q: "¿Ofreces soporte después del despliegue?",
    a: "Sí. Todo proyecto incluye un periodo de garantía posterior al lanzamiento para resolver cualquier imprevisto técnico y asegurar que todo funcione según lo acordado.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <JsonLd data={graph(personRef(), serviceNodes(SERVICES), breadcrumbNode([{ name: "Servicios", path: "/servicios" }]))} />
      <PageHeader
        index="03"
        eyebrow="Servicios & soluciones"
        title={
          <>
            Qué puedo construir <span className="font-serif">para tu negocio</span>
          </>
        }
        lede="Desarrollo soluciones digitales basadas en tecnologías que ya he aplicado en proyectos reales. Sin prometer capas innecesarias: trato directo, alcance claro y foco en resolver el problema operativo o comercial."
        notes={[
          { label: "Modalidad", value: "Remoto · Cali, Colombia" },
          { label: "Respuesta", value: "Menos de 24 horas" },
        ]}
        actions={
          <>
            <Link href="/contacto?motivo=servicio" className={buttonVariants({ variant: "signal", size: "lg" })}>
              <span>Solicitar propuesta</span>
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
            <a
              href={CONTACT.whatsappUrl("Hola Diego, quiero consultar sobre un proyecto")}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <MessageSquare aria-hidden="true" size={15} />
              <span>WhatsApp directo</span>
            </a>
          </>
        }
      />

      {/* Servicios: filas numeradas gigantes */}
      <section aria-label="Servicios" className="border-t border-line">
        {SERVICES.map((s, i) => (
          <article key={s.slug} id={s.slug} className="container-x scroll-mt-24 border-b border-line py-20 sm:py-28">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                  <span className="display block text-[clamp(5rem,12vw,11rem)] leading-[0.8] text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="eyebrow mt-4">{s.badge}</p>
                </div>
              </div>

              <div className="lg:col-span-9">
                <SplitReveal className="display display-md text-ink">{s.name}</SplitReveal>
                <Reveal>
                  <p className="lede mt-8 max-w-[60ch]">{s.summary}</p>
                </Reveal>

                <Reveal stagger className="mt-14 grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                  <div className="bg-paper py-6 sm:pr-8">
                    <h3 className="eyebrow">El problema habitual</h3>
                    <p className="mt-3 leading-relaxed text-ink">{s.problem}</p>
                  </div>
                  <div className="bg-paper py-6 sm:pl-8">
                    <h3 className="eyebrow text-signal">La solución que entrego</h3>
                    <p className="mt-3 leading-relaxed text-ink">{s.solution}</p>
                  </div>
                </Reveal>

                <div className="mt-12 grid grid-cols-1 gap-10 border-t border-line pt-8 lg:grid-cols-9">
                  <div className="lg:col-span-5">
                    <h3 className="eyebrow">Entregables concretos</h3>
                    <ul className="mt-4 space-y-3">
                      {s.deliverables.map((d) => (
                        <li key={d} className="flex gap-3 text-ink">
                          <span aria-hidden="true" className="font-mono text-signal">
                            +
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between gap-8 lg:col-span-4">
                    <div className="flex flex-wrap gap-1.5">
                      {s.technologies.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                    <Link
                      href={`/contacto?motivo=servicio&servicio=${s.slug}`}
                      className={buttonVariants({ variant: "primary", size: "lg", className: "self-start" })}
                    >
                      <span>Cotizar este servicio</span>
                      <ArrowRight aria-hidden="true" size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Preguntas frecuentes */}
      <section className="container-x py-24 sm:py-32">
        <SectionHeading
          index="FAQ"
          eyebrow="Claridad antes de empezar"
          title={
            <>
              Preguntas <span className="font-serif">frecuentes</span>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12">
          <div className="border-t border-line lg:col-span-9 lg:col-start-4">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="display text-[clamp(1.15rem,2vw,1.7rem)] leading-tight text-ink transition-colors group-hover:text-signal">
                    {faq.q}
                  </span>
                  <Plus
                    aria-hidden="true"
                    size={22}
                    strokeWidth={1.5}
                    className="flex-none text-ink-muted transition-transform duration-500 ease-expo group-open:rotate-45 group-open:text-signal"
                  />
                </summary>
                <p className="max-w-[64ch] pb-8 leading-relaxed text-ink-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
