import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/jobs/copy-button";
import { DescriptionEditor } from "@/components/jobs/description-editor";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MODALITY_LABELS,
  SECTION_LABELS,
  STATUS_META,
} from "@/components/jobs/labels";
import { ScoreBadge } from "@/components/jobs/score-badge";
import { buttonVariants } from "@/components/ui/button";
import { htmlToText } from "@/lib/jobs/analysis/normalize";
import { EVIDENCE_LABELS } from "@/lib/jobs/analysis/match";
import { sourceInfo } from "@/lib/jobs/sources";
import type { JobAnalysis, Keyword, NormalizedJob, Tip } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

const PRIORITY_CLASS: Record<Keyword["priority"], string> = {
  alta: "border-signal/60 text-signal",
  media: "border-line-focus text-ink",
  baja: "border-line text-ink-subtle",
};

const TIP_LABELS: Record<Tip["kind"], string> = {
  faltante: "falta",
  agregar: "agregar",
  reformular: "reformular",
  ordenar: "ordenar",
  formato: "formato",
  resumen: "resumen",
};

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Vista del análisis de una vacante (sin carga de datos). */
export function JobAnalysisView({
  job,
  analysis,
}: {
  job: NormalizedJob & { id: string };
  analysis: JobAnalysis;
}) {
  const info = sourceInfo(job.source);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: analysis.keywords.filter((k) => k.category === category),
  })).filter((g) => g.items.length);

  const important = analysis.keywords.filter((k) => k.priority !== "baja" && k.category !== "frase");
  const toAdd = analysis.keywords.filter((k) => k.status !== "presente" && k.category !== "cargo");
  const req = analysis.requirements;

  return (
      <div className="min-w-0 space-y-8">
        {/* Encabezado */}
        <header className="flex flex-wrap items-start gap-5">
          <ScoreBadge score={analysis.score} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold text-ink">{job.title}</h2>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              {[job.company, job.location, job.modality && MODALITY_LABELS[job.modality], job.salary ?? req.salary]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
              vía {info?.label ?? "pegada a mano"} · HV con ~{analysis.cvYears} año(s) de experiencia
            </p>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
              >
                abrir vacante para postularme <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        </header>

        {info?.partialDescription && (
          <div className="border border-amber/40 p-4">
            <p className="font-body text-sm text-ink">
              {info.label} solo entrega un fragmento de la descripción, así que el análisis es aproximado. Abre la
              vacante y pega el texto completo para un resultado exacto.
            </p>
            <div className="mt-3">
              <DescriptionEditor jobId={job.id} />
            </div>
          </div>
        )}

        {/* Desglose del puntaje */}
        <Section title="Qué tan bien encajas">
          <ul className="space-y-3">
            {analysis.components.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
                  <span className="text-ink">{c.label}</span>
                  <span className="text-ink-muted">
                    {c.ratio === null ? "no aplica" : `${Math.round(c.points)} / ${Math.round(c.maxPoints)}`}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-surface-elevated">
                  <div className="h-full bg-signal" style={{ width: `${Math.round((c.ratio ?? 0) * 100)}%` }} />
                </div>
                <p className="mt-1 font-body text-xs text-ink-subtle">{c.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Palabras clave */}
        <Section
          title="Palabras clave que deben estar en tu HV"
          aside={
            <div className="flex flex-wrap gap-2">
              <CopyButton text={important.map((k) => k.term).join(", ")} label="copiar importantes" />
              <CopyButton text={toAdd.map((k) => k.term).join(", ")} label="copiar las que faltan" />
            </div>
          }
        >
          <p className="font-body text-xs text-ink-subtle">
            <span className="text-emerald">✓</span> ya está en tu HV · <span className="text-amber">≈</span> está con
            otra forma (usa el término de la vacante) · <span className="text-red-600">✗</span> falta. Ordenadas por
            prioridad dentro de cada grupo.
          </p>
          <div className="mt-5 space-y-6">
            {grouped.map(({ category, items }) => (
              <div key={category}>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
                  {CATEGORY_LABELS[category]}
                </h3>
                <ul className="mt-2 divide-y divide-line border border-line">
                  {items.map((k) => {
                    const meta = STATUS_META[k.status];
                    return (
                      <li key={k.key} className="flex flex-wrap items-start gap-x-3 gap-y-1 px-3 py-2">
                        <span className={cn("w-4 font-mono text-sm", meta.className)} title={meta.label}>
                          {meta.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm text-ink">{k.term}</p>
                          <p className="font-mono text-[10px] text-ink-subtle">
                            {k.sections.map((s) => SECTION_LABELS[s]).join(", ")}
                            {k.occurrences > 1 && ` · ${k.occurrences} menciones`}
                            {k.evidence.length > 0 &&
                              ` · en tu HV: ${[...new Set(k.evidence.map((e) => (e.kind === "skill" || e.kind === "perfil" ? EVIDENCE_LABELS[e.kind] : `${EVIDENCE_LABELS[e.kind]} «${e.label}»`)))].slice(0, 3).join(", ")}`}
                            {k.status === "variante" && k.evidence[0] && ` (como «${k.evidence[0].term}»)`}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
                            PRIORITY_CLASS[k.priority],
                          )}
                        >
                          {k.priority}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Tips */}
        <Section title="Tips para organizar tu HV">
          <ol className="space-y-3">
            {analysis.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 border border-line p-3">
                <span
                  className={cn(
                    "h-fit flex-none border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
                    PRIORITY_CLASS[tip.priority],
                  )}
                >
                  {TIP_LABELS[tip.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm text-ink">{tip.text}</p>
                  {tip.href && (
                    <Link
                      href={tip.href}
                      className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-signal hover:underline"
                    >
                      editar en el panel <ArrowRight size={11} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Resumen profesional sugerido" aside={<CopyButton text={analysis.suggestedSummary} />}>
          <p className="border border-line p-4 font-body text-sm text-ink">{analysis.suggestedSummary}</p>
          <p className="mt-2 font-body text-xs text-ink-subtle">
            Armado solo con datos de tu HV. Ajústalo con tu voz antes de usarlo.
          </p>
        </Section>

        {analysis.suggestedSkillOrder.length > 0 && (
          <Section
            title="Orden sugerido de tus skills"
            aside={<CopyButton text={analysis.suggestedSkillOrder.join(", ")} />}
          >
            <p className="font-body text-sm text-ink">{analysis.suggestedSkillOrder.join(" · ")}</p>
          </Section>
        )}

        <Section title="Requisitos detectados">
          <dl className="grid gap-x-6 gap-y-3 font-body text-sm sm:grid-cols-2">
            {[
              ["Experiencia mínima", req.minYears ? `${req.minYears} año(s)` : null],
              ["Nivel", req.seniority],
              ["Educación", req.educationLevel?.label ?? null],
              [
                "Idiomas",
                req.languages.length
                  ? req.languages
                      .map((l) => `${l.language}${l.levelLabel ? ` ${l.levelLabel}` : ""}${l.required ? "" : " (deseable)"}`)
                      .join(", ")
                  : null,
              ],
              ["Modalidad", req.modality ? MODALITY_LABELS[req.modality] : null],
              ["Salario", job.salary ?? req.salary],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[11px] text-ink-subtle">{label}</dt>
                <dd className="text-ink">{value ?? "no indicado"}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Descripción de la vacante">
          <details>
            <summary className="cursor-pointer font-mono text-xs text-ink-muted hover:text-signal">mostrar texto</summary>
            <p className="mt-3 whitespace-pre-line font-body text-sm text-ink-muted">{htmlToText(job.description)}</p>
          </details>
        </Section>
      </div>
  );
}
