import type { Metadata } from "next";
import { Section, Tag } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Sobre mí — Diego Alejandro Muñoz",
};

const HEADLINE_TECH = [
  "TypeScript", "Next.js", "React", "Python", "FastAPI",
  "PostgreSQL", "AI", "n8n", "Docker", "Vercel", "GitHub Actions",
];

export default function SobreMiPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">sobre mí</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Diego Alejandro Muñoz
      </h1>
      <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-muted">
        {/* TODO: reemplazar con biografía real desde el dashboard (tabla profiles) */}
        TODO: biografía profesional — trayectoria, cómo llegaste a la ingeniería
        de software, y qué te interesa construir hoy.
      </p>

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-base font-semibold text-ink">Tecnologías principales</h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {HEADLINE_TECH.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </Section>
  );
}
