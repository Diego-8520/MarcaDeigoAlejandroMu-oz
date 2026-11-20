"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJobAction, reanalyzeJobAction, updateApplicationAction } from "@/actions/jobs";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/jobs/constants";
import { Button } from "@/components/ui/button";

export function ApplicationControls({
  jobId,
  status,
  notes,
}: {
  jobId: string;
  status: ApplicationStatus;
  notes: string | null;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentNotes, setCurrentNotes] = useState(notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ status: string; message?: string }>, after?: () => void) =>
    startTransition(async () => {
      const result = await fn();
      setMessage(result.message ?? null);
      if (result.status === "success") {
        after?.();
        router.refresh();
      }
    });

  return (
    <div className="space-y-3 border border-line p-4">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">postulación</p>
      <label className="block">
        <span className="font-mono text-xs text-ink-muted">estado</span>
        <select
          value={currentStatus}
          disabled={isPending}
          onChange={(e) => {
            const next = e.target.value as ApplicationStatus;
            setCurrentStatus(next);
            run(() => updateApplicationAction(jobId, next));
          }}
          className="mt-1.5 w-full border border-line bg-paper px-3 py-2 font-mono text-sm text-ink"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-mono text-xs text-ink-muted">notas</span>
        <textarea
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          rows={3}
          placeholder="Contacto, fecha de entrevista, salario conversado…"
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={isPending} onClick={() => run(() => updateApplicationAction(jobId, currentStatus, currentNotes))}>
          guardar notas
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => run(() => reanalyzeJobAction(jobId))}>
          recalcular
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm("¿Eliminar esta vacante y su análisis?")) return;
            run(() => deleteJobAction(jobId), () => router.push("/dashboard/empleo/postulaciones"));
          }}
        >
          eliminar
        </Button>
      </div>
      {message && <p className="font-mono text-[11px] text-ink-muted">{message}</p>}
    </div>
  );
}
