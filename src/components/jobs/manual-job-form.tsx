"use client";

import { useActionState } from "react";
import { createManualJobAction, type JobActionState } from "@/actions/jobs";
import { Button } from "@/components/ui/button";

const initialState: JobActionState = { status: "idle" };
const INPUT =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";
const LABEL = "font-mono text-xs text-ink-muted";

export function ManualJobForm() {
  const [state, formAction, isPending] = useActionState(createManualJobAction, initialState);
  return (
    <form action={formAction} className="mt-8 max-w-3xl space-y-5">
      <div>
        <label htmlFor="text" className={LABEL}>
          texto de la vacante (recomendado)
        </label>
        <textarea
          id="text"
          name="text"
          rows={14}
          placeholder="Pega aquí la descripción completa: funciones, requisitos, deseables…"
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor="url" className={LABEL}>
          enlace de la vacante
        </label>
        <input id="url" name="url" type="url" placeholder="https://…" className={INPUT} />
        <p className="mt-1 font-body text-xs text-ink-subtle">
          Si no pegas el texto, se intentará leer la página. LinkedIn y otros sitios con inicio de sesión suelen
          bloquearlo: en ese caso pega el texto.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="title" className={LABEL}>
            cargo (opcional)
          </label>
          <input id="title" name="title" className={INPUT} />
        </div>
        <div>
          <label htmlFor="company" className={LABEL}>
            empresa (opcional)
          </label>
          <input id="company" name="company" className={INPUT} />
        </div>
        <div>
          <label htmlFor="location" className={LABEL}>
            ubicación (opcional)
          </label>
          <input id="location" name="location" className={INPUT} />
        </div>
      </div>
      <Button type="submit" isLoading={isPending}>
        analizar vacante
      </Button>
      {state.status === "error" && (
        <p role="alert" className="font-mono text-xs text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
