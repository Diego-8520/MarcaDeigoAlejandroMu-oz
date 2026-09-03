import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Experiencia — Diego Alejandro Muñoz",
};

export default function ExperienciaPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">experiencia</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Trayectoria profesional
      </h1>
      <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
        {/* TODO: conectar con tabla `experiences` en Supabase (Fase 2) */}
        TODO: cargar experiencias reales (empresa, cargo, fechas, logros) desde
        el dashboard.
      </p>
    </Section>
  );
}
