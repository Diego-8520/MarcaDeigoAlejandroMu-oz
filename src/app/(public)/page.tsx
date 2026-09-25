import Link from "next/link";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  Code2,
  Layers,
  Cpu,
  GraduationCap,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { Section, Tag } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/projects/project-card";
import { getPublishedProjects } from "@/lib/data/projects-queries";
import { getExperiences } from "@/lib/data/experiences-queries";
import { getPublishedTestimonials } from "@/lib/data/testimonials-queries";

export const revalidate = 60;

const CAPABILITIES = [
  {
    id: "fullstack",
    icon: Code2,
    title: "Desarrollo Web Full-Stack",
    eyebrow: "Front & Back Tipado",
    description:
      "Aplicaciones web modernas de alto rendimiento con Next.js (App Router), React, TypeScript y C# .NET. Enfoque en código modular, arquitecturas limpias y UX sin fricción.",
    deliverables: ["Plataformas en producción", "Diseño responsivo optimizado", "Server Actions & APIs seguras", "Pruebas y tipado TypeScript"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "C# .NET"],
  },
  {
    id: "databases",
    icon: Layers,
    title: "Arquitectura de Datos & Supabase",
    eyebrow: "PostgreSQL & Seguridad",
    description:
      "Diseño de esquemas relacionales, políticas de seguridad a nivel de fila (RLS), almacenamiento seguro de archivos y persistencia confiable para plataformas con múltiples usuarios.",
    deliverables: ["Modelado relacional en PostgreSQL", "Políticas RLS estrictas", "Gestión de buckets en Storage", "Auditoría e integridad de datos"],
    stack: ["Supabase", "PostgreSQL", "RLS", "Storage", "SQL"],
  },
  {
    id: "integrations",
    icon: Cpu,
    title: "Automatización & APIs de Datos",
    eyebrow: "Flujos & Reconciliación",
    description:
      "Normalización de catálogos e inventarios, consumo de APIs geoespaciales y comerciales, y automatización de tareas operativas para eliminar el trabajo manual repetitivo.",
    deliverables: ["Integración de APIs de terceros", "Procesamiento y mapeo masivo", "Webhooks y sincronizaciones", "Alertas y registros en tiempo real"],
    stack: ["APIs REST", "OpenRouteService", "Webhooks", "Node.js"],
  },
];

export default async function HomePage() {
  const [projects, experiences, testimonials] = await Promise.all([
    getPublishedProjects(),
    getExperiences(),
    getPublishedTestimonials(3),
  ]);

  const featuredProjects = projects.filter((p) => p.featured);
  const showcaseProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);

  // Mapeo dinámico: Skill -> Proyectos reales donde se aplicó
  const skillToProjectsMap = new Map<string, string[]>();
  projects.forEach((p) => {
    p.technologies.forEach((tech) => {
      const existing = skillToProjectsMap.get(tech) || [];
      if (!existing.includes(p.title)) {
        existing.push(p.title);
      }
      skillToProjectsMap.set(tech, existing);
    });
  });

  const totalStars = projects.reduce(
    (acc, p) => acc + (p.githubMetadata?.stars ?? 0),
    0
  );

  return (
    <div className="relative overflow-hidden">
      {/* 1. HERO SECTION: Posicionamiento Asertivo + Microcredenciales + Doble CTA */}
      <section className="relative tech-grid border-b border-line pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-12">
          {/* Eyebrow interactivo de credibilidad */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-1 font-mono text-xs text-ink-muted shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
            </span>
            <span className="text-ink font-medium">Diego Alejandro Muñoz</span>
            <span className="text-ink-subtle">·</span>
            <span>Software Developer</span>
            <span className="text-ink-subtle">·</span>
            <span className="text-signal-light">Cali, Colombia</span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.12]">
            Construyo productos web completos, herramientas a medida y flujos que funcionan en producción.
          </h1>

          <p className="mt-6 max-w-2xl font-body text-base sm:text-lg leading-relaxed text-ink-muted">
            Estudiante de Ingeniería de Sistemas con experiencia en conciliación masiva de datos turísticos en Juniper Travel Technology y background riguroso en gestión de procesos. Desarrollo con Next.js, React, TypeScript, C# .NET y PostgreSQL.
          </p>

          {/* Doble CTA Interactivo para Recruiter vs Cliente */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/proyectos">
              <Button variant="signal" size="lg" rightIcon={<ArrowRight size={16} />}>
                Ver Proyectos y Código Real
              </Button>
            </Link>
            <Link href="/contacto">
              <Button variant="secondary" size="lg">
                Hablemos de tu Proyecto
              </Button>
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-signal transition-colors py-2 px-1 ml-1"
            >
              <FileText size={15} />
              <span>Descargar CV (PDF)</span>
            </Link>
          </div>

          {/* Micro-credenciales & Estado de Producción */}
          <div className="bracket-frame mt-12 grid gap-3 border border-line bg-surface/80 p-5 sm:grid-cols-4 font-mono text-xs text-ink-muted rounded-sm">
            <div>
              <p className="text-[10px] uppercase text-ink-subtle">Stack Principal</p>
              <p className="mt-1 text-ink font-semibold">Next.js · React · TS</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-ink-subtle">Base de Datos</p>
              <p className="mt-1 text-ink font-semibold">Supabase · PostgreSQL</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-ink-subtle">Backend Alterno</p>
              <p className="mt-1 text-ink font-semibold">C# · .NET Core</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-ink-subtle">Disponibilidad</p>
              <p className="mt-1 text-emerald font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Inmediata / Remoto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF & MÉTRICAS EN VIVO */}
      <section className="border-b border-line bg-surface/40 py-8">
        <div className="mx-auto max-w-4xl px-5 lg:px-12 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
          <div className="border-l-2 border-signal pl-4 py-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {projects.length}
            </span>
            <p className="text-ink-muted text-[11px] mt-0.5">Proyectos en Catálogo</p>
          </div>
          <div className="border-l-2 border-emerald pl-4 py-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">100%</span>
            <p className="text-ink-muted text-[11px] mt-0.5">Código Tipado & Repos</p>
          </div>
          <div className="border-l-2 border-signal-light pl-4 py-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {totalStars > 0 ? `${totalStars}+` : "Open"}
            </span>
            <p className="text-ink-muted text-[11px] mt-0.5">Stars & Open Source</p>
          </div>
          <div className="border-l-2 border-amber pl-4 py-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">UNIAJC</span>
            <p className="text-ink-muted text-[11px] mt-0.5">Ingeniería de Sistemas</p>
          </div>
        </div>
      </section>

      {/* 3. PROYECTOS DESTACADOS: Interactive Showcase */}
      <Section id="proyectos">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span>TRABAJO REAL Y COMPROBABLE</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
              Proyectos destacados
            </h2>
          </div>
          <Link
            href="/proyectos"
            className="font-mono text-xs text-signal hover:underline flex items-center gap-1"
          >
            <span>Ver catálogo completo ({projects.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
          Cada proyecto demuestra decisiones arquitectónicas reales: análisis de riesgo geoespacial, catálogos e-commerce con Supabase, landing pages de alta conversión y código limpio en GitHub.
        </p>

        <div className="mt-8 space-y-5">
          {showcaseProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </Section>

      {/* 4. CAPACIDADES & SOLUCIONES: Qué puedo construir */}
      <Section className="border-t border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span>SOLUCIONES PARA CLIENTES Y EQUIPOS</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
              Qué puedo construir para ti
            </h2>
          </div>
          <Link
            href="/servicios"
            className="font-mono text-xs text-signal hover:underline flex items-center gap-1"
          >
            <span>Detalle de servicios & entregables</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="bracket-frame flex flex-col justify-between border border-line bg-surface/80 p-6 rounded-sm hover:border-line-focus transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-signal-light" />
                    <span className="font-mono text-[10px] text-ink-subtle uppercase">
                      {cap.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {cap.title}
                  </h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-ink-muted">
                    {cap.description}
                  </p>

                  <div className="mt-4 border-t border-line/60 pt-3">
                    <p className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider font-semibold">
                      Entregables típicos:
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {cap.deliverables.map((deliv) => (
                        <li key={deliv} className="flex items-start gap-1.5 font-body text-xs text-ink-muted">
                          <CheckCircle2 size={12} className="text-signal-light mt-0.5 flex-none" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {cap.stack.slice(0, 3).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                  <Link
                    href={`/contacto?motivo=servicio&servicio=${cap.id}`}
                    className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
                  >
                    <span>Cotizar</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 5. STACK TECNOLÓGICO CONECTADO A PROYECTOS REALES */}
      <Section className="border-t border-line">
        <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          <span>EVIDENCIA DE HABILIDADES</span>
        </div>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
          Stack técnico con respaldo en código
        </h2>
        <p className="mt-2 max-w-xl font-body text-sm text-ink-muted leading-relaxed">
          No muestro habilidades como una lista aislada sin evidencia. Cada tecnología clave está vinculada a los proyectos reales donde se implementó:
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(skillToProjectsMap.entries())
            .slice(0, 9)
            .map(([tech, techProjects]) => (
              <div
                key={tech}
                className="border border-line bg-surface/60 p-4 rounded-sm hover:border-line-focus transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-sm text-ink">{tech}</span>
                  <Badge variant="tech">
                    {techProjects.length} {techProjects.length === 1 ? "proyecto" : "proyectos"}
                  </Badge>
                </div>
                <p className="font-mono text-[11px] text-ink-subtle mt-2">Aplicado en:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {techProjects.map((pName) => (
                    <span
                      key={pName}
                      className="font-body text-xs text-signal-light/90 hover:underline"
                    >
                      {pName} ·
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Section>

      {/* 6. TIMELINE: Experiencia & Educación */}
      <Section className="border-t border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span>RIGOR OPERATIVO & FORMACIÓN</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
              Trayectoria profesional
            </h2>
          </div>
          <Link
            href="/experiencia"
            className="font-mono text-xs text-signal hover:underline flex items-center gap-1"
          >
            <span>Ver trayectoria completa</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 border border-line bg-surface/70 p-6 sm:p-8 rounded-sm">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-signal-light font-mono text-xs font-semibold">
                <Briefcase size={14} />
                <span>EXPERIENCIA TÉCNICA ACTUAL</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {experiences[0]?.position ?? "Mapping Agent"}
              </h3>
              <p className="font-mono text-xs text-ink-muted mt-1">
                {experiences[0]?.company ?? "Juniper Travel Technology"} · 2024 — Presente
              </p>
              <p className="mt-3 font-body text-xs sm:text-sm text-ink-muted leading-relaxed">
                Gestión, normalización y conciliación de inventarios masivos de distribución turística entre cientos de proveedores XML/APIs y clientes en tiempo real, garantizando exactitud geoespacial y disponibilidad de datos.
              </p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-line sm:pl-8 pt-6 sm:pt-0">
              <div className="flex items-center gap-2 text-signal-light font-mono text-xs font-semibold">
                <GraduationCap size={14} />
                <span>FORMACIÓN UNIVERSITARIA</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                Ingeniería en Sistemas de Información
              </h3>
              <p className="font-mono text-xs text-ink-muted mt-1">
                Institución Universitaria Antonio José Camacho (UNIAJC) · 2024 — 2029
              </p>
              <p className="mt-3 font-body text-xs sm:text-sm text-ink-muted leading-relaxed">
                Formación en algoritmos, estructuras de datos, arquitectura de software y bases de datos relacionales. Complementado con titulación tecnológica previa en SST (SENA).
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. TESTIMONIOS (Social Proof) */}
      {testimonials.length > 0 && (
        <Section className="border-t border-line">
          <div className="flex items-center gap-2 font-mono text-xs text-signal-light font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            <span>CONFIRMACIóN DE CLIENTES</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            Lo que dicen quienes han colaborado conmigo
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="bracket-frame border border-line bg-surface/80 p-5 rounded-sm">
                <blockquote className="font-body text-xs sm:text-sm leading-relaxed text-ink-muted">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 font-mono text-xs text-ink">
                  <span className="font-semibold">{t.authorName}</span>
                  {(t.authorRole || t.authorCompany) && (
                    <span className="block text-ink-subtle text-[11px] mt-0.5">
                      {[t.authorRole, t.authorCompany].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* 8. CTA FINAL PERSUASIVO & FOOTER TÉCNICO */}
      <Section className="border-t border-line pb-28">
        <div className="bracket-frame border border-line bg-surface/90 p-8 sm:p-12 rounded-sm shadow-lg">
          <p className="font-mono text-xs text-signal-light font-semibold uppercase tracking-wider">
            ¿Listo para dar el siguiente paso?
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-ink">
            Iniciemos una conversación
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
            Tanto si buscas un desarrollador con rigor técnico para tu equipo de ingeniería, como si necesitas construir un producto digital o automatización a medida para tu empresa.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/contacto">
              <Button variant="signal" size="lg" rightIcon={<ArrowRight size={15} />}>
                Escribir Mensaje Directo
              </Button>
            </Link>
            <a
              href="https://wa.me/573215150904?text=Hola%20Diego,%20vi%20tu%20perfil%20y%20me%20gustar%C3%ADa%20conversar."
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="secondary" size="lg" leftIcon={<MessageSquare size={15} />}>
                WhatsApp Directo
              </Button>
            </a>
            <Link href="/cv">
              <Button variant="outline" size="lg" leftIcon={<FileText size={15} />}>
                Descargar CV (PDF)
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-ink-subtle">
            <span>Cali, Colombia · diego_8520@outlook.com</span>
            <span>Respuesta en menos de 24 horas laborables</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
