import { ExternalLink } from "lucide-react";
import { ScoreBadge } from "@/components/jobs/score-badge";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { MODALITY_LABELS } from "@/components/jobs/labels";
import { buttonVariants } from "@/components/ui/button";
import { getSavedJobKeysAdmin } from "@/lib/data/jobs-queries";
import { analyzeJob } from "@/lib/jobs/analysis";
import { getMasterCv } from "@/lib/jobs/master-cv";
import { COUNTRIES, isCountryCode, searchAllSources, sourceInfo } from "@/lib/jobs/sources";
import { splitSkillKeywords } from "@/lib/jobs/analysis/score";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 40;
const INPUT =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";

export default async function EmpleoBuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pais?: string; remoto?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 100);
  const country = isCountryCode(params.pais) ? params.pais : "co";
  // Sin búsqueda previa, "incluir remotos" viene marcado.
  const remote = query ? params.remoto === "1" : true;

  const search = query
    ? await Promise.all([searchAllSources({ query, country, remote }), getMasterCv(), getSavedJobKeysAdmin()])
    : null;

  const results = search
    ? search[0].jobs
        .map((job) => ({ job, analysis: analyzeJob(job, search[1]) }))
        .sort((a, b) => b.analysis.score - a.analysis.score)
        .slice(0, MAX_RESULTS)
    : [];

  return (
    <div className="mt-8">
      <form method="get" className="grid gap-4 border border-line p-4 sm:grid-cols-[1fr_180px_auto_auto] sm:items-end">
        <label className="block">
          <span className="font-mono text-xs text-ink-muted">cargo o palabras clave</span>
          <input name="q" defaultValue={query} required placeholder="analista administrativo, automatización…" className={INPUT} />
        </label>
        <label className="block">
          <span className="font-mono text-xs text-ink-muted">país</span>
          <select name="pais" defaultValue={country} className={`${INPUT} bg-paper`}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 font-mono text-xs text-ink">
          <input type="checkbox" name="remoto" value="1" defaultChecked={remote} />
          incluir remotos
        </label>
        <button type="submit" className={buttonVariants({ size: "md" })}>
          buscar
        </button>
      </form>

      {!search && (
        <p className="mt-8 max-w-2xl font-body text-sm text-ink-muted">
          Escribe un cargo para buscar en Get on Board, Remotive, Adzuna y Jooble. Cada resultado trae su puntaje de
          compatibilidad con tu HV. ¿Encontraste la vacante en otro portal? Usa <strong>pegar vacante</strong>.
        </p>
      )}

      {search && (
        <>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-ink-subtle">
            {search[0].statuses.map((s) => (
              <li key={s.id} title={s.message}>
                <a href={s.homepage} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
                  {s.label}
                </a>
                :{" "}
                {s.state === "ok"
                  ? `${s.count} resultado(s)`
                  : s.state === "error"
                    ? "no respondió"
                    : s.state === "desactivada"
                      ? "sin API key"
                      : "no aplica para este país"}
              </li>
            ))}
          </ul>

          {results.length === 0 ? (
            <p className="mt-8 font-body text-sm text-ink-muted">
              No hubo resultados. Prueba con un término más general o pega una vacante que hayas visto.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {results.map(({ job, analysis }) => {
                const { required } = splitSkillKeywords(analysis.keywords);
                const have = required.filter((k) => k.status !== "falta").slice(0, 4);
                const missing = required.filter((k) => k.status === "falta").slice(0, 4);
                const info = sourceInfo(job.source);
                return (
                  <article key={`${job.source}:${job.externalId}`} className="flex gap-4 border border-line p-4">
                    <ScoreBadge score={analysis.score} />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-base font-semibold text-ink">{job.title}</h2>
                      <p className="mt-1 font-mono text-xs text-ink-muted">
                        {[job.company, job.location, job.modality && MODALITY_LABELS[job.modality], job.salary]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {have.length > 0 && (
                        <p className="mt-2 font-body text-xs text-ink">
                          <span className="text-emerald">✓</span> {have.map((k) => k.term).join(", ")}
                        </p>
                      )}
                      {missing.length > 0 && (
                        <p className="mt-1 font-body text-xs text-ink">
                          <span className="text-red-600">✗</span> {missing.map((k) => k.term).join(", ")}
                        </p>
                      )}
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
                        vía {info?.label ?? job.source}
                        {info?.partialDescription && " · descripción parcial: el puntaje es aproximado"}
                      </p>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-2">
                      <SaveJobButton job={job} savedId={search[2].get(`${job.source}:${job.externalId}`)} />
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-signal"
                        >
                          abrir vacante <ExternalLink size={11} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
