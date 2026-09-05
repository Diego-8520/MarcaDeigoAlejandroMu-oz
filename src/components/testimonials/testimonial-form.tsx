"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import type { Testimonial } from "@/lib/data/testimonials-queries";
import type { TestimonialActionState } from "@/actions/testimonials";

const initialState: TestimonialActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";

type TestimonialAction = (
  previousState: TestimonialActionState,
  formData: FormData,
) => Promise<TestimonialActionState>;

export function TestimonialForm({
  action,
  projects,
  testimonial,
  submitLabel,
}: {
  action: TestimonialAction;
  projects: Project[];
  testimonial?: Testimonial | null;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="author_name"
            className="font-mono text-xs text-ink-muted"
          >
            nombre del autor
          </label>
          <input
            id="author_name"
            name="author_name"
            required
            defaultValue={testimonial?.authorName ?? ""}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="author_role"
            className="font-mono text-xs text-ink-muted"
          >
            cargo / rol
          </label>
          <input
            id="author_role"
            name="author_role"
            defaultValue={testimonial?.authorRole ?? ""}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="author_company"
          className="font-mono text-xs text-ink-muted"
        >
          empresa
        </label>
        <input
          id="author_company"
          name="author_company"
          defaultValue={testimonial?.authorCompany ?? ""}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="quote" className="font-mono text-xs text-ink-muted">
          testimonio
        </label>
        <textarea
          id="quote"
          name="quote"
          required
          rows={6}
          defaultValue={testimonial?.quote ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="project_id"
            className="font-mono text-xs text-ink-muted"
          >
            proyecto vinculado
          </label>
          <select
            id="project_id"
            name="project_id"
            defaultValue={testimonial?.projectId ?? ""}
            className={inputClassName}
          >
            <option value="">ninguno</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="sort_order"
            className="font-mono text-xs text-ink-muted"
          >
            orden
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min="0"
            defaultValue={testimonial?.sortOrder ?? 0}
            className={inputClassName}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs text-ink-muted">
        <input
          name="published"
          type="checkbox"
          defaultChecked={testimonial?.published ?? false}
          className="size-4 accent-signal"
        />
        publicado
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
      >
        {isPending ? "guardando..." : submitLabel}
      </button>
      {state.status !== "idle" && (
        <p
          className={`font-mono text-xs ${
            state.status === "success" ? "text-signal" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
