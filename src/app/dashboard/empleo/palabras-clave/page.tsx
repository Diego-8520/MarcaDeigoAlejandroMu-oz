import Link from "next/link";
import { CopyButton } from "@/components/jobs/copy-button";
import { CATEGORY_LABELS, STATUS_META } from "@/components/jobs/labels";
import { getSavedJobsAdmin } from "@/lib/data/jobs-queries";
import { aggregateKeywords } from "@/lib/jobs/aggregate";
import { analyzeJob } from "@/lib/jobs/analysis";
import { getMasterCv } from "@/lib/jobs/master-cv";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MAX_ROWS = 60;

export default async function PalabrasClavePage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  const params = await searchParams;
  const onlyMissing = params.ver === "faltan";
  const [jobs, cv] = await Promise.all([getSavedJobsAdmin(), getMasterCv()]);
  // Se excluyen vacantes descartadas; el análisis se rehace con tu HV actual.
  const active = jobs.filter((j) => j.status !== "descartada");
  const aggregated = aggregateKeywords(active.map((job) => analyzeJob(job, cv).keywords));
  const rows = (onlyMissing ? aggregated.filter((k) => k.status !== "presente") : aggregated).slice(0, MAX_ROWS);
  const missingTerms = aggregated.filter((k) => k.status !== "presente" && k.jobs >= 2).map((k) => k.term);

  return (
    <div className="mt-6">
      <p className="max-w-2xl font-body text-sm text-ink-muted">
        Palabras clave más pedidas en tus {active.length} vacante(s) guardada(s), comparadas con tu HV actual. Úsalas
        para priorizar qué reforzar en tu HV general.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtro" className="flex gap-2 font-mono text-xs">
          <Link
            href="/dashboard/empleo/palabras-clave"
            className={!onlyMissing ? "bg-ink px-3 py-1.5 text-paper" : "px-3 py-1.5 text-ink-muted hover:text-signal"}
          >
            todas
          </Link>
          <Link
            href="/dashboard/empleo/palabras-clave?ver=faltan"
            className={onlyMissing ? "bg-ink px-3 py-1.5 text-paper" : "px-3 py-1.5 text-ink-muted hover:text-signal"}
          >
            faltan o con otra forma
          </Link>
        </nav>
        {missingTerms.length > 0 && <CopyButton text={missingTerms.join(", ")} label="copiar las que faltan (2+ vacantes)" />}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 font-body text-sm text-ink-muted">
          {active.length === 0 ? "Guarda algunas vacantes para ver el ranking." : "Tu HV ya cubre todas las palabras clave."}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto border border-line">
          <table className="w-full min-w-[560px] text-left">
            <thead className="border-b border-line font-mono text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
              <tr>
                <th className="px-3 py-2 font-normal">en tu HV</th>
                <th className="px-3 py-2 font-normal">palabra clave</th>
                <th className="px-3 py-2 font-normal">categoría</th>
                <th className="px-3 py-2 text-right font-normal">vacantes</th>
                <th className="px-3 py-2 text-right font-normal">como requisito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-body text-sm">
              {rows.map((k) => {
                const meta = STATUS_META[k.status];
                return (
                  <tr key={k.key}>
                    <td className={cn("px-3 py-2 font-mono", meta.className)} title={meta.label}>
                      {meta.icon}
                    </td>
                    <td className="px-3 py-2 text-ink">{k.term}</td>
                    <td className="px-3 py-2 font-mono text-xs text-ink-muted">{CATEGORY_LABELS[k.category]}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-ink">{k.jobs}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-ink-muted">{k.requiredShare}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
