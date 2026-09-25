"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Rocket,
  MessageSquare,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { submitContact, type ContactActionState } from "@/actions/contact";
import { getOrCreateSessionId } from "@/lib/analytics/session";
import { Button } from "@/components/ui/button";

const initialState: ContactActionState = { status: "idle" };

type IntentType = "empleo" | "servicio" | "otro";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  const prefillMotivo = (searchParams?.get("motivo") as IntentType) ?? "servicio";
  const prefillServicio = searchParams?.get("servicio");
  const prefillProyecto = searchParams?.get("proyecto");

  const [selectedIntent, setSelectedIntent] = useState<IntentType>(
    prefillMotivo === "empleo" ? "empleo" : "servicio"
  );

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
      <div className="border border-emerald/50 bg-emerald-dim/40 p-8 text-center rounded-sm space-y-4">
        <CheckCircle2 className="h-10 w-10 text-emerald mx-auto" />
        <h3 className="font-display text-xl font-bold text-ink">
          ¡Mensaje recibido con éxito!
        </h3>
        <p className="font-body text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
          {state.message || "Gracias por escribirme. Revisaré los detalles y te responderé a tu correo en menos de 24 horas."}
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/573215150904?text=Hola%20Diego,%20acabo%20de%20enviarte%20un%20mensaje%20a%20trav%C3%A9s%20de%20tu%20sitio%20web."
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="signal" size="sm" leftIcon={<MessageSquare size={14} />}>
              Avisar por WhatsApp
            </Button>
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink px-3 py-2"
          >
            <RefreshCw size={12} />
            <span>Enviar otro mensaje</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="sessionId" value="" readOnly />
      <input type="hidden" name="source" value="" readOnly />
      <input type="hidden" name="userAgent" value="" readOnly />

      {/* Selector de intención visual */}
      <div>
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
          ¿Cuál es el motivo de tu contacto? *
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              id: "empleo",
              title: "Propuesta Laboral",
              desc: "Contratación para equipo",
              icon: Briefcase,
            },
            {
              id: "servicio",
              title: "Desarrollo de Proyecto",
              desc: "Cotizar software / app",
              icon: Rocket,
            },
            {
              id: "otro",
              title: "Consulta General",
              desc: "Colaboración / Otro",
              icon: MessageSquare,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isChecked = selectedIntent === item.id;
            return (
              <label
                key={item.id}
                className={`relative flex flex-col p-3 rounded-sm border cursor-pointer select-none transition-all ${
                  isChecked
                    ? "border-signal bg-signal-dim text-ink shadow-sm"
                    : "border-line bg-surface/60 text-ink-muted hover:border-line-focus hover:text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="requestType"
                  value={item.id}
                  checked={isChecked}
                  onChange={() => setSelectedIntent(item.id as IntentType)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <Icon
                    size={14}
                    className={isChecked ? "text-signal-light" : "text-ink-subtle"}
                  />
                  <span className="font-mono text-xs font-semibold text-ink">
                    {item.title}
                  </span>
                </div>
                <span className="font-body text-[11px] text-ink-muted mt-1">
                  {item.desc}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block font-mono text-xs text-ink-muted mb-1">
            Tu nombre o empresa *
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Ej: Sofia Gómez o TechCorp"
            className="w-full rounded-sm border border-line bg-surface/60 px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink-subtle/50 outline-none transition-all focus:border-signal focus:bg-surface"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-mono text-xs text-ink-muted mb-1">
            Correo electrónico *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@empresa.com"
            className="w-full rounded-sm border border-line bg-surface/60 px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink-subtle/50 outline-none transition-all focus:border-signal focus:bg-surface"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block font-mono text-xs text-ink-muted mb-1">
          Empresa, startup o enlace web (opcional)
        </label>
        <input
          id="company"
          name="company"
          placeholder="Ej: https://miempresa.com"
          className="w-full rounded-sm border border-line bg-surface/60 px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink-subtle/50 outline-none transition-all focus:border-signal focus:bg-surface"
        />
      </div>

      <div>
        <label htmlFor="message" className="block font-mono text-xs text-ink-muted mb-1">
          Detalle del mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          defaultValue={defaultMessage}
          placeholder="Describe brevemente el alcance del proyecto, las tecnologías requeridas o la posición que buscas cubrir..."
          className="w-full rounded-sm border border-line bg-surface/60 px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink-subtle/50 outline-none transition-all focus:border-signal focus:bg-surface leading-relaxed"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="signal"
          size="lg"
          isLoading={isPending}
          className="w-full sm:w-auto"
          rightIcon={<ArrowRight size={15} />}
        >
          {isPending ? "Enviando mensaje..." : "Enviar mensaje directo"}
        </Button>
      </div>

      {state.status === "error" && (
        <div className="flex items-start gap-2.5 border border-red-400/40 bg-red-950/30 p-3.5 text-xs font-mono text-red-400 rounded-sm">
          <AlertCircle size={15} className="flex-none mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}
    </form>
  );
}
