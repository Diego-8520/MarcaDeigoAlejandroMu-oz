"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContact, type ContactActionState } from "@/actions/contact";
import { getOrCreateSessionId } from "@/lib/analytics/session";

const initialState: ContactActionState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  const [analyticsContext, setAnalyticsContext] = useState({
    sessionId: "",
    source: "",
    userAgent: "",
  });

  useEffect(() => {
    setAnalyticsContext({
      sessionId: getOrCreateSessionId(),
      source: document.referrer,
      userAgent: navigator.userAgent,
    });
  }, []);

  return (
    <form action={formAction} className="mt-10 max-w-lg space-y-5">
      <input type="hidden" name="sessionId" value={analyticsContext.sessionId} />
      <input type="hidden" name="source" value={analyticsContext.source} />
      <input type="hidden" name="userAgent" value={analyticsContext.userAgent} />

      <div>
        <label htmlFor="name" className="font-mono text-xs text-ink-muted">
          nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div>
        <label htmlFor="email" className="font-mono text-xs text-ink-muted">
          correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div>
        <label htmlFor="company" className="font-mono text-xs text-ink-muted">
          empresa (opcional)
        </label>
        <input
          id="company"
          name="company"
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div>
        <label htmlFor="requestType" className="font-mono text-xs text-ink-muted">
          motivo del contacto
        </label>
        <select
          id="requestType"
          name="requestType"
          required
          defaultValue="servicio"
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        >
          <option value="empleo">Oportunidad laboral</option>
          <option value="servicio">Quiero contratar un servicio</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="font-mono text-xs text-ink-muted">
          mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
      >
        {isPending ? "enviando…" : "enviar mensaje"}
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
