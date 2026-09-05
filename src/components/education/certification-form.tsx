"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Certification } from "@/lib/data/education-queries";
import type { CertificationActionState } from "@/actions/certifications";

const initialState: CertificationActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";
type CertificationAction = (
  previousState: CertificationActionState,
  formData: FormData,
) => Promise<CertificationActionState>;

export function CertificationForm({
  action,
  certification,
  submitLabel,
}: {
  action: CertificationAction;
  certification?: Certification | null;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className="font-mono text-xs text-ink-muted">
          nombre
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={certification?.name ?? ""}
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="issuer" className="font-mono text-xs text-ink-muted">
          emisor
        </label>
        <input
          id="issuer"
          name="issuer"
          defaultValue={certification?.issuer ?? ""}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor="issue_date"
          className="font-mono text-xs text-ink-muted"
        >
          fecha de emisión
        </label>
        <input
          id="issue_date"
          name="issue_date"
          type="date"
          defaultValue={certification?.issueDate?.slice(0, 10) ?? ""}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor="credential_url"
          className="font-mono text-xs text-ink-muted"
        >
          url de credencial
        </label>
        <input
          id="credential_url"
          name="credential_url"
          type="url"
          placeholder="https://..."
          defaultValue={certification?.credentialUrl ?? ""}
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
