"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, MessageSquare, RefreshCw } from "lucide-react";
import { submitContact, type ContactActionState } from "@/actions/contact";
import { getOrCreateSessionId } from "@/lib/analytics/session";
import { Button, buttonVariants } from "@/components/ui/button";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";

const initialState: ContactActionState = { status: "idle" };

type IntentType = "empleo" | "servicio" | "otro";

const INTENTS: { id: IntentType; title: string; desc: string }[] = [
  { id: "empleo", title: "Propuesta laboral", desc: "Contratación para equipo" },
  { id: "servicio", title: "Desarrollo de proyecto", desc: "Cotizar software / app" },
  { id: "otro", title: "Consulta general", desc: "Colaboración / otro" },
];

const FIELD =
  "peer w-full border-0 border-b border-line-focus bg-transparent px-0 pb-3 pt-2 text-lg text-ink placeholder:text-ink-subtle outline-none transition-colors focus:border-signal focus-visible:outline-none";
const LABEL = "block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  const prefillMotivo = (searchParams?.get("motivo") as IntentType) ?? "servicio";
  const prefillServicio = searchParams?.get("servicio");
  const prefillProyecto = searchParams?.get("proyecto");

  const [selectedIntent, setSelectedIntent] = useState<IntentType>(prefillMotivo === "empleo" ? "empleo" : "servicio");

  const defaultMessage = prefillProyecto
    ? `Hola Diego, vi tu proyecto "${prefillProyecto}" y me gustaría discutir una solución similar para mi empresa...`
    : prefillServicio
      ? `Hola Diego, me interesa consultar y cotizar el servicio de ${prefillServicio}...`
      : "";

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const setHiddenField = (name: string, value: string) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement) field.value = value;
    };

    setHiddenField("sessionId", getOrCreateSessionId());
    setHiddenField("source", document.referrer);
    setHiddenField("userAgent", navigator.userAgent);
  }, []);

  if (state.status === "success") {
    return (
      <div role="status" className="border-t-2 border-signal pt-10">
        <p className="eyebrow text-signal">Mensaje recibido</p>
        <h3 className="display display-sm mt-4 text-ink">
          Gracias. <span className="font-serif">Te respondo pronto.</span>
        </h3>
        <p className="mt-6 max-w-[56ch] leading-relaxed text-ink-muted">
          {state.message || "Gracias por escribirme. Revisaré los detalles y te responderé a tu correo en menos de 24 horas."}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={CONTACT.whatsappUrl("Hola Diego, acabo de enviarte un mensaje a través de tu sitio web.")}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "signal", size: "md" })}
          >
            <MessageSquare aria-hidden="true" size={14} />
            <span>Avisar por WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
          >
            <RefreshCw aria-hidden="true" size={12} />
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-12">
      <input type="hidden" name="sessionId" value="" readOnly />
      <input type="hidden" name="source" value="" readOnly />
      <input type="hidden" name="userAgent" value="" readOnly />

      <fieldset>
        <legend className={LABEL}>01 — ¿Cuál es el motivo de tu contacto? *</legend>
        <div className="mt-4 grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
          {INTENTS.map((item) => {
            const isChecked = selectedIntent === item.id;
            return (
              <label
                key={item.id}
                className={cn(
                  "relative flex cursor-pointer select-none flex-col gap-2 p-5 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-signal",
                  isChecked ? "bg-signal text-signal-ink" : "bg-paper text-ink hover:bg-surface",
                )}
              >
                <input
                  type="radio"
                  name="requestType"
                  value={item.id}
                  checked={isChecked}
                  onChange={() => setSelectedIntent(item.id)}
                  className="sr-only"
                />
                <span className="display text-xl leading-none">{item.title}</span>
                <span className={cn("font-mono text-[11px] uppercase tracking-[0.06em]", isChecked ? "text-signal-ink/70" : "text-ink-muted")}>
                  {item.desc}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-12 sm:grid-cols-2 sm:gap-8">
        <div>
          <label htmlFor="name" className={LABEL}>
            02 — Tu nombre o empresa *
          </label>
          <input id="name" name="name" required autoComplete="name" placeholder="Sofía Gómez o TechCorp" className={FIELD} />
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>
            03 — Correo electrónico *
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@empresa.com" className={FIELD} />
        </div>
      </div>

      <div>
        <label htmlFor="company" className={LABEL}>
          04 — Empresa, startup o enlace web <span className="text-ink-subtle">(opcional)</span>
        </label>
        <input id="company" name="company" autoComplete="organization" placeholder="https://miempresa.com" className={FIELD} />
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          05 — Detalle del mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          placeholder="Describe brevemente el alcance del proyecto, las tecnologías requeridas o la posición que buscas cubrir..."
          className={cn(FIELD, "resize-y leading-relaxed")}
        />
      </div>

      {state.status === "error" && (
        <div role="alert" className="flex items-start gap-3 border-l-2 border-red-400 bg-red-950/30 p-4 font-mono text-xs text-red-300">
          <AlertCircle aria-hidden="true" size={15} className="mt-0.5 flex-none" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">Respuesta personal en menos de 24 h</p>
        <Button type="submit" variant="signal" size="lg" isLoading={isPending} rightIcon={<ArrowRight aria-hidden="true" size={15} />}>
          {isPending ? "Enviando mensaje..." : "Enviar mensaje"}
        </Button>
      </div>
    </form>
  );
}
