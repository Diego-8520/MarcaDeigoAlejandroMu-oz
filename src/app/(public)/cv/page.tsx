import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { CvDownloadLink } from "@/components/analytics/cv-download-link";

export const metadata: Metadata = {
  title: "CV — Diego Alejandro Muñoz",
};

export default function CvPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">cv</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Hoja de vida
      </h1>
      <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
        {/* TODO: reemplazar con URL real desde Supabase Storage (bucket `cv`) */}
        TODO: subir el PDF del CV desde el dashboard y enlazarlo aquí.
      </p>
      <CvDownloadLink />
    </Section>
  );
}
