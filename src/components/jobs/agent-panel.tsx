import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/jobs/copy-button";
import type { AgentOutputRow } from "@/lib/data/jobs-queries";
import { VERDICT_LABELS, offerEvaluationSchema } from "@/lib/jobs/agent/schemas";
import { cn } from "@/lib/utils";

const VERDICT_CLASS = {
  postular: "border-emerald/50 text-emerald",
  postular_con_ajustes: "border-amber/50 text-amber",
  no_recomendado: "border-red-600/40 text-red-600",
} as const;

const SEVERITY_CLASS = {
  alta: "text-red-600",
  media: "text-amber",
  baja: "text-ink-subtle",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function StaleNotice({ row, fingerprint }: { row: AgentOutputRow; fingerprint: string }) {
  if (row.cvFingerprint === fingerprint) return null;
  return (
    <p className="mt-2 font-mono text-[11px] text-amber">
      Tu HV cambió después de generar esto. Vuelve a ejecutar el comando para actualizarlo.
    </p>
  );
}

function Command({ command }: { command: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="border border-line bg-surface-elevated px-2 py-1 font-mono text-xs text-ink">{command}</code>
      <CopyButton text={command} />
    </div>
  );
}

/** Resultados del agente de Claude Code para una vacante. */
export function AgentPanel({
  jobId,
  evaluation,
  hv,
  fingerprint,
}: {
  jobId: string;
  evaluation: AgentOutputRow | null;
  hv: AgentOutputRow | null;
  fingerprint: string;
}) {
  const parsed = evaluation ? offerEvaluationSchema.safeParse(evaluation.content) : null;
  const data = parsed?.success ? parsed.data : null;

  return (
    <section className="border-t border-line pt-6">
      <h2 className="font-display text-lg font-semibold text-ink">Agente (Claude Code)</h2>
      <p className="mt-1 font-body text-xs text-ink-subtle">
        Evaluación y HV adaptada generadas con Claude Code y tu suscripción, sin costo de API. Ejecuta los comandos en
        Claude Code, dentro de la carpeta del repo.
      </p>

      <div className="mt-5 space-y-6">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">evaluación de la oferta</h3>
          {data && evaluation ? (
            <div className="mt-2 space-y-4 border border-line p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]",
                    VERDICT_CLASS[data.verdict],
                  )}
                >
                  {VERDICT_LABELS[data.verdict]}
                </span>
                <span className="font-mono text-[10px] text-ink-subtle">{formatDate(evaluation.createdAt)}</span>
              </div>
              <p className="font-body text-sm text-ink">{data.fitSummary}</p>
              {data.strengths.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">fortalezas</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 font-body text-sm text-ink">
                    {data.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.gaps.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">brechas</p>
                  <ul className="mt-1 space-y-2 font-body text-sm text-ink">
                    {data.gaps.map((g, i) => (
                      <li key={i}>
                        <span className={cn("font-mono text-[10px] uppercase", SEVERITY_CLASS[g.severity])}>
                          {g.severity}
                        </span>{" "}
                        <strong className="font-semibold">{g.item}</strong> — {g.mitigation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {[
                ["riesgos", data.risks],
                ["preguntas para la entrevista", data.questionsToAsk],
                ["acciones recomendadas", data.recommendedActions],
              ].map(([label, items]) =>
                (items as string[]).length ? (
                  <div key={label as string}>
                    <p className="font-mono text-[11px] text-ink-muted">{label as string}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 font-body text-sm text-ink">
                      {(items as string[]).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
              <StaleNotice row={evaluation} fingerprint={fingerprint} />
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-ink-muted">Aún no hay evaluación.</p>
          )}
          <Command command={`/evaluar-oferta ${jobId}`} />
        </div>

        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">hv adaptada</h3>
          {hv ? (
            <div className="mt-2 border border-line p-4">
              <Link
                href={`/dashboard/empleo/${jobId}/hv`}
                className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline"
              >
                ver e imprimir la HV adaptada <ArrowRight size={12} aria-hidden="true" />
              </Link>
              <p className="mt-1 font-mono text-[10px] text-ink-subtle">{formatDate(hv.createdAt)}</p>
              <StaleNotice row={hv} fingerprint={fingerprint} />
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-ink-muted">Aún no hay HV adaptada.</p>
          )}
          <Command command={`/adaptar-hv ${jobId}`} />
        </div>
      </div>
    </section>
  );
}
