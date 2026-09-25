import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Terminal, Compass } from "lucide-react";
import { ProfileLinkIcon } from "@/components/profile/profile-link-icon";
import { Section, Tag } from "@/components/ui/section";
import { getProfile, getProfileLinks } from "@/lib/data/profile-queries";
import { getSkills } from "@/lib/data/skills-queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sobre Diego Alejandro Muñoz — Historia, Enfoque & Principios",
  description:
    "De la gestión de procesos y normatividad rigurosa al desarrollo de software en Next.js, React, TypeScript y C# .NET.",
};

export default async function SobreMiPage() {
  const [profile, links, skills] = await Promise.all([
    getProfile(),
    getProfileLinks(),
    getSkills(),
  ]);

  const fullName = profile?.fullName ?? "Diego Alejandro Muñoz Arcos";
  const skillGroups = skills.reduce<Record<string, typeof skills>>(
    (groups, skill) => {
      const category = skill.category ?? "Tecnologías";
      (groups[category] ??= []).push(skill);
      return groups;
    },
    {},
  );

  return (
    <div>
      <Section className="max-w-4xl pt-16 pb-12 lg:pt-24">
        <p className="font-mono text-xs text-ink-muted">perfil profesional & principios</p>

        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          {profile?.avatarUrl && (
            <div className="relative h-28 w-28 flex-none overflow-hidden border border-line bg-surface/80 rounded-sm">
              <Image
                src={profile.avatarUrl}
                alt={`Fotografía de ${fullName}`}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
              {fullName}
            </h1>
            <p className="mt-2 font-mono text-sm text-signal-light font-medium">
              Software Developer · Cali, Valle del Cauca, Colombia
            </p>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-ink-muted">
              Estudiante de Ingeniería en Sistemas de Información en la UNIAJC. Construyo aplicaciones web modernas, paneles de gestión e integraciones con Next.js, React, TypeScript, C# .NET y PostgreSQL.
            </p>
          </div>
        </div>

        {links.length > 0 && (
          <nav className="mt-8 flex flex-wrap gap-2.5" aria-label="Redes y enlaces verificados">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                className="inline-flex items-center gap-2 border border-line bg-surface/70 px-3 py-1.5 font-mono text-xs text-ink-muted transition-colors hover:border-signal hover:text-signal"
              >
                <ProfileLinkIcon name={link.icon} size={14} />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        )}
      </Section>

      {/* La Historia y Transición */}
      <Section className="border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink">
          De la gestión de procesos al desarrollo de software
        </h2>
        <div className="mt-6 space-y-4 max-w-2xl font-body text-sm leading-relaxed text-ink-muted">
          <p>
            Mi trayectoria profesional comenzó en el área de Seguridad y Salud en el Trabajo (SST). En ese entorno, la atención rigurosa a las normas, el análisis metódico de matrices de riesgos y el control estricto de procedimientos no son opcionales: son la diferencia entre un ambiente seguro y una contingencia grave.
          </p>
          <p>
            Esa disciplina estructurada fue la base con la que redirigí mi vocación hacia la ingeniería y la tecnología. Descubrí que la arquitectura de software comparte esa misma naturaleza: requiere modelar datos con precisión, prever fallos en las capas de entrada, respetar contratos de API y construir sistemas resilientes que no dependan de la improvisación.
          </p>
          <p>
            Actualmente curso Ingeniería en Sistemas de Información en la Institución Universitaria Antonio José Camacho (UNIAJC) y trabajo como Mapping Agent en Juniper Travel Technology, donde normalizo y concilio catálogos masivos de distribución turística entre cientos de proveedores XML/APIs y clientes internacionales en tiempo real.
          </p>
        </div>

        {/* Pilares de trabajo */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-surface/60 p-4">
            <ShieldCheck className="h-5 w-5 text-signal-light mb-2" />
            <h3 className="font-display text-sm font-semibold text-ink">Rigor en Datos</h3>
            <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
              Esquemas relacionales sólidos en PostgreSQL, tipado estricto con TypeScript y validación de esquemas con Zod.
            </p>
          </div>
          <div className="border border-line bg-surface/60 p-4">
            <Terminal className="h-5 w-5 text-emerald mb-2" />
            <h3 className="font-display text-sm font-semibold text-ink">Pragmatismo Técnico</h3>
            <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
              Soluciones diseñadas para resolver el problema real sin caer en modas pasajeras ni sobreingeniería innecesaria.
            </p>
          </div>
          <div className="border border-line bg-surface/60 p-4">
            <Compass className="h-5 w-5 text-amber mb-2" />
            <h3 className="font-display text-sm font-semibold text-ink">Evolución Continua</h3>
            <p className="font-body text-xs text-ink-muted mt-1 leading-relaxed">
              Formación universitaria activa, proyectos propios en producción y experimentación con automatización y agentes de IA.
            </p>
          </div>
        </div>
      </Section>

      {/* Habilidades Técnicas Organizadas */}
      <Section className="border-t border-line">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Stack y herramientas comprobadas
        </h2>
        <p className="mt-2 text-xs font-mono text-ink-muted">
          Tecnologías aplicadas en proyectos reales, repositorios y plataformas en vivo:
        </p>

        <div className="mt-8 space-y-6">
          {Object.entries(skillGroups).map(([category, categorySkills]) => (
            <div key={category} className="border-t border-line/60 pt-4 first:border-t-0 first:pt-0">
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-signal-light font-semibold">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categorySkills.map((skill) => (
                  <Tag key={skill.id}>{skill.name}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA final */}
      <Section className="border-t border-line pb-28">
        <div className="bracket-frame border border-line bg-paper/90 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              ¿Quieres conocer más sobre mi trabajo?
            </h2>
            <p className="mt-2 font-body text-sm text-ink-muted max-w-md">
              Revisa los proyectos construidos o ponte en contacto directo para discutir una oportunidad o colaboración.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/proyectos"
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-xs text-paper hover:bg-signal transition-colors"
            >
              <span>ver proyectos</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center gap-2 border border-line px-4 py-2.5 font-mono text-xs text-ink hover:border-signal hover:text-signal transition-colors"
            >
              <FileText size={13} />
              <span>descargar cv</span>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
