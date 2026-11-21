import type { Metadata } from "next";
import { EmpleoNav } from "@/components/jobs/empleo-nav";

export const metadata: Metadata = { title: "Empleo" };

export default function EmpleoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / empleo</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Buscador de empleo</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-ink-muted">
        Busca vacantes, mide qué tan bien encaja tu HV y obtén las palabras clave y tips para ajustarla. El análisis
        usa reglas y tus datos del panel (experiencia, skills, educación, proyectos); no usa IA.
      </p>
      <EmpleoNav />
      {children}
    </div>
  );
}
