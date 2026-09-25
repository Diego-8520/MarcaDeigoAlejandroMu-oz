import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Zap } from "lucide-react";
import { Section, Tag } from "@/components/ui/section";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Servicios de Desarrollo Web & Automatización",
  description:
    "Soluciones digitales a medida: aplicaciones web completas, landing pages de alta conversión y automatización de procesos para negocios y startups.",
};

const SERVICES = [
  {
    slug: "aplicaciones-web",
    name: "Desarrollo de Aplicaciones Web a Medida",
    badge: "Full-Stack",
    summary:
      "Construyo aplicaciones web completas y robustas, desde la arquitectura de base de datos hasta la interfaz de usuario.",
    problem:
      "Necesitas un sistema propio para tu negocio (catálogo interactivo, panel de administración, intranet o portal de clientes) pero las herramientas genéricas no se ajustan a tus reglas de negocio.",
    solution:
      "Desarrollo frontend en Next.js/React con backend en Server Actions o C# .NET y bases de datos relacionales en PostgreSQL / Supabase, con autenticación, permisos por rol y rendimiento garantizado.",
    deliverables: [
      "Aplicación web responsiva desplegada en producción (Vercel / Cloud)",
      "Base de datos PostgreSQL estructurada y con reglas de seguridad (RLS)",
      "Panel de administración privado para gestionar tu contenido o datos",
      "Código fuente completo, tipado en TypeScript y documentado",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "C# .NET"],
  },
  {
    slug: "landing-pages-conversion",
    name: "Landing Pages de Alta Conversión & SEO",
    badge: "Frontend & CRO",
    summary:
      "Páginas comerciales y sitios corporativos enfocados en velocidad extrema, claridad de propuesta y captación de clientes.",
    problem:
      "Tu sitio web actual tarda en cargar, se ve mal en teléfonos móviles o recibe visitas pero nadie te contacta ni compra.",
    solution:
      "Diseño e implemento páginas de aterrizaje livianas y persuasivas con entrega estática (Next.js, Vite o Astro) que cargan al instante y facilitan el contacto directo por WhatsApp o formulario.",
    deliverables: [
      "Entrega estática con puntajes máximos en Core Web Vitals",
      "Formularios de contacto integrados y notificaciones directas",
      "Estructura semántica optimizada para motores de búsqueda (SEO)",
      "Diseño adaptable y fluido probado en múltiples dispositivos",
    ],
    technologies: ["React", "Vite", "Astro", "Tailwind CSS", "HTML5 Semántico", "Analytics anónimo"],
  },
  {
    slug: "automatizacion-integraciones",
    name: "Automatización de Flujos & Conexión de APIs",
    badge: "Integraciones",
    summary:
      "Conecto tus herramientas y bases de datos para eliminar la carga operativa manual y reconciliar información.",
    problem:
      "Tu equipo pierde horas diarias copiando datos entre hojas de cálculo, sistemas de inventario, correos y plataformas externas.",
    solution:
      "Implemento scripts e integraciones de APIs REST y webhooks para sincronizar inventarios, normalizar datos de múltiples fuentes y disparar notificaciones automáticas.",
    deliverables: [
      "Integración estable entre sistemas mediante APIs y webhooks",
      "Normalización y limpieza automática de datos",
      "Manejo de errores y alertas ante fallos de sincronización",
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
    <div>
      <Section className="max-w-4xl pt-16 pb-12 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">servicios & soluciones</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
          Qué puedo construir para tu negocio
        </h1>
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
          Desarrollo soluciones digitales basadas exclusivamente en tecnologías y capacidades que domino con rigor. Sin sobrecostos de agencia ni plantillas infladas: trato directo con el desarrollador que construye tu producto.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal"
          >
            solicitar propuesta o consulta
            <ArrowRight size={15} />
          </Link>
          <a
            href="https://wa.me/573215150904?text=Hola%20Diego,%20quiero%20consultar%20sobre%20un%20proyecto"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-signal hover:text-signal"
          >
            <MessageSquare size={15} />
            <span>escribir al WhatsApp directo</span>
          </a>
        </div>
      </Section>

      {/* Servicios detallados */}
      <Section className="border-t border-line">
        <div className="space-y-12">
          {SERVICES.map((s, idx) => (
            <article
              key={s.slug}
              className="bracket-frame border border-line bg-paper/70 p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-signal font-medium">
                  0{idx + 1} · {s.badge}
                </span>
                <span className="font-mono text-[11px] text-ink-muted">Cali, Colombia · Remoto</span>
              </div>

              <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                {s.name}
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted max-w-2xl">
                {s.summary}
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 border-t border-line pt-6">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                    El problema habitual
                  </h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-ink-muted">
                    {s.problem}
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                    La solución que entrego
                  </h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-ink-muted">
                    {s.solution}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                  Entregables concretos
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 font-body text-xs text-ink-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-signal flex-none mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-line pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {s.technologies.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>

                <Link
                  href={`/contacto?motivo=servicio&servicio=${s.slug}`}
                  className="inline-flex items-center gap-1.5 bg-ink px-4 py-2 font-mono text-xs text-paper transition-colors hover:bg-signal"
                >
                  <span>cotizar este servicio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Preguntas frecuentes de clientes */}
      <Section className="border-t border-line">
        <p className="font-mono text-xs text-ink-muted">claridad</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border border-line p-5 bg-surface/70 rounded-sm">
              <h3 className="font-display text-sm font-semibold text-ink">
                {faq.q}
              </h3>
              <p className="mt-2 font-body text-xs leading-relaxed text-ink-muted">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA final */}
      <Section className="border-t border-line pb-28">
        <div className="border border-line bg-paper/90 p-8 sm:p-10 text-center max-w-2xl mx-auto">
          <Zap className="h-6 w-6 text-signal mx-auto" />
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
            ¿Tienes un requerimiento específico?
          </h2>
          <p className="mt-2 font-body text-sm text-ink-muted leading-relaxed">
            Hablemos sobre tu idea o sistema. Te respondo personalmente en menos de 24 horas con una opinión técnica honesta y sin compromiso.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper hover:bg-signal transition-colors"
            >
              iniciar conversación
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
