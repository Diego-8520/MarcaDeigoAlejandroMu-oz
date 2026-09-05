"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Skill } from "@/lib/data/skills-queries";
import type { SkillActionState } from "@/actions/skills";

const initialState: SkillActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";
type SkillAction = (
  previousState: SkillActionState,
  formData: FormData,
) => Promise<SkillActionState>;

export function SkillForm({
  action,
  skill,
  submitLabel,
}: {
  action: SkillAction;
  skill?: Skill | null;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);
  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-mono text-xs text-ink-muted">
            nombre
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={skill?.name ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="font-mono text-xs text-ink-muted"
          >
            categoría
          </label>
          <input
            id="category"
            name="category"
            placeholder="Frontend, Backend, IA..."
            defaultValue={skill?.category ?? ""}
            className={inputClassName}
          />
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
          rows={4}
          defaultValue={skill?.description ?? ""}
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
