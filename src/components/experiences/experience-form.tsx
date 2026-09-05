"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Experience } from "@/lib/data/experiences-queries";
import type { ExperienceActionState } from "@/actions/experiences";

const initialState: ExperienceActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";

type ExperienceAction = (
  previousState: ExperienceActionState,
  formData: FormData,
) => Promise<ExperienceActionState>;

function formatDateInput(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

export function ExperienceForm({
  action,
  experience,
  submitLabel,
}: {
  action: ExperienceAction;
  experience?: Experience | null;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isCurrent, setIsCurrent] = useState(!experience?.endDate);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="font-mono text-xs text-ink-muted">
            empresa
          </label>
          <input
            id="company"
            name="company"
            required
            defaultValue={experience?.company ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="position"
            className="font-mono text-xs text-ink-muted"
          >
            cargo
          </label>
          <input
            id="position"
            name="position"
            required
            defaultValue={experience?.position ?? ""}
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
            defaultValue={formatDateInput(experience?.startDate ?? null)}
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
            defaultValue={formatDateInput(experience?.endDate ?? null)}
            className={inputClassName}
          />
          <label className="mt-2 flex items-center gap-2 font-mono text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(event) => setIsCurrent(event.target.checked)}
              className="size-4 accent-signal"
            />{" "}
            posición actual
          </label>
        </div>
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
          defaultValue={experience?.description ?? ""}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor="achievements"
          className="font-mono text-xs text-ink-muted"
        >
          logros, uno por línea
        </label>
        <textarea
          id="achievements"
          name="achievements"
          rows={6}
          defaultValue={experience?.achievements.join("\n") ?? ""}
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
