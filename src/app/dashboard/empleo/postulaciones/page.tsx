import Link from "next/link";
import { ScoreBadge } from "@/components/jobs/score-badge";
import { MODALITY_LABELS } from "@/components/jobs/labels";
import { APPLICATION_STATUSES, getSavedJobsAdmin, isApplicationStatus } from "@/lib/data/jobs-queries";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
}

export default async function PostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const params = await searchParams;
  const status = isApplicationStatus(params.estado) ? params.estado : undefined;
  const jobs = await getSavedJobsAdmin(status);

  return (
    <div className="mt-6">
      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2 font-mono text-xs">
        <Link
          href="/dashboard/empleo/postulaciones"
          className={!status ? "bg-ink px-3 py-1.5 text-paper" : "px-3 py-1.5 text-ink-muted hover:text-signal"}
        >
          todas
        </Link>
        {APPLICATION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/empleo/postulaciones?estado=${s}`}
            className={status === s ? "bg-ink px-3 py-1.5 text-paper" : "px-3 py-1.5 text-ink-muted hover:text-signal"}
          >
            {s}
          </Link>
        ))}
      </nav>

      {jobs.length === 0 ? (
        <p className="mt-8 font-body text-sm text-ink-muted">
          No hay vacantes {status ? `en estado «${status}»` : "guardadas"}. Busca o pega una vacante para empezar.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border border-line">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/dashboard/empleo/${job.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-elevated">
                <ScoreBadge score={job.score} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-ink">{job.title}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-ink-muted">
                    {[job.company, job.location, job.modality && MODALITY_LABELS[job.modality]].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex-none text-right font-mono text-[11px]">
                  <p className="uppercase tracking-[0.06em] text-ink">{job.status}</p>
                  <p className="text-ink-subtle">
                    {job.appliedAt ? `postulada ${formatDate(job.appliedAt)}` : `guardada ${formatDate(job.createdAt)}`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
