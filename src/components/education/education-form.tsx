"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Education } from "@/lib/data/education-queries";
import type { EducationActionState } from "@/actions/education";

const initialState: EducationActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";
type EducationAction = (
  previousState: EducationActionState,
  formData: FormData,
) => Promise<EducationActionState>;

export function EducationForm({
  action,
  education,
  submitLabel,
}: {
  action: EducationAction;
  education?: Education | null;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isCurrent, setIsCurrent] = useState(!education?.endDate);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="institution"
            className="font-mono text-xs text-ink-muted"
          >
            institución
          </label>
          <input
            id="institution"
            name="institution"
            required
            defaultValue={education?.institution ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="program" className="font-mono text-xs text-ink-muted">
            programa
          </label>
          <input
            id="program"
            name="program"
            required
            defaultValue={education?.program ?? ""}
            className={inputClassName}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="start_date"
            className="font-mono text-xs text-ink-muted"
          >
            fecha de inicio
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={education?.startDate.slice(0, 10) ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="end_date"
            className="font-mono text-xs text-ink-muted"
          >
            fecha de finalización
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            disabled={isCurrent}
            defaultValue={education?.endDate?.slice(0, 10) ?? ""}
            className={inputClassName}
          />
          <label className="mt-2 flex items-center gap-2 font-mono text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(event) => setIsCurrent(event.target.checked)}
              className="size-4 accent-signal"
            />{" "}
            en curso
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="status" className="font-mono text-xs text-ink-muted">
          estado
        </label>
        <input
          id="status"
          name="status"
          placeholder="completado, en curso..."
          defaultValue={education?.status ?? ""}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="font-mono text-xs text-ink-muted"
        >
          descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={education?.description ?? ""}
          className={inputClassName}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
      >
        {isPending ? "guardando..." : submitLabel}
      </button>
      {state.status !== "idle" && (
        <p
          className={`font-mono text-xs ${state.status === "success" ? "text-signal" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
