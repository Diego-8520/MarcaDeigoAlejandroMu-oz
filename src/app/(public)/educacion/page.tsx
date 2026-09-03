import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Educación — Diego Alejandro Muñoz",
};

export default function EducacionPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">educación</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Formación académica y técnica
      </h1>
      <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
        {/* TODO: conectar con tabla `education` en Supabase (Fase 2) */}
        TODO: cargar programas, instituciones y certificaciones reales desde
        el dashboard.
      </p>
    </Section>
  );
}
