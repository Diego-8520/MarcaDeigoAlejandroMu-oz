import { Suspense } from "react";
import type { Metadata } from "next";
import { Mail, MessageSquare, MapPin, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact-form";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contacto Directo",
  description:
    "Escribe directamente a Diego Alejandro Muñoz para oportunidades laborales en desarrollo de software, cotización de proyectos web o consultas técnicas.",
};

export default function ContactoPage() {
  return (
    <Section className="max-w-4xl pt-16 pb-24 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">canales de contacto</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
        Iniciemos una conversación
      </h1>
      <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink-muted">
        ¿Tienes una propuesta laboral para tu equipo de ingeniería o necesitas desarrollar un producto web a medida? Cuéntame sobre ello. Respondo personalmente cada mensaje.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Formulario principal */}
        <div className="bracket-frame border border-line bg-paper/60 p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink">
            Enviar un mensaje directo
          </h2>
          <p className="mt-1 font-body text-xs text-ink-muted">
            Completa los datos y te responderé a tu correo en menos de 24 horas.
          </p>
          <div className="mt-6">
            <Suspense fallback={<p className="font-mono text-xs text-ink-muted">Cargando formulario…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>

        {/* Canales directos e información de contacto */}
        <div className="space-y-6">
          <div className="border border-line bg-surface/70 p-6 rounded-sm">
            <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
              Canales inmediatos
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="mailto:diego_8520@outlook.com"
                className="group flex items-start gap-3 text-ink-muted hover:text-signal transition-colors"
              >
                <Mail className="h-4 w-4 mt-0.5 text-signal flex-none" />
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">Correo electrónico</p>
                  <p className="font-body text-sm font-medium text-ink group-hover:text-signal">
                    diego_8520@outlook.com
                  </p>
                </div>
              </a>

              <a
                href="https://wa.me/573215150904?text=Hola%20Diego,%20vi%20tu%20perfil%20profesional%20y%20me%20gustar%C3%ADa%20conversar."
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 text-ink-muted hover:text-signal transition-colors"
              >
                <MessageSquare className="h-4 w-4 mt-0.5 text-signal flex-none" />
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">WhatsApp directo</p>
                  <p className="font-body text-sm font-medium text-ink group-hover:text-signal">
                    +57 321 515 0904
                  </p>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/dalejandromunoz"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 text-ink-muted hover:text-signal transition-colors"
              >
                <LinkedinIcon className="h-4 w-4 mt-0.5 text-signal flex-none" />
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">LinkedIn</p>
                  <p className="font-body text-sm font-medium text-ink group-hover:text-signal">
                    in/dalejandromunoz
                  </p>
                </div>
              </a>

              <a
                href="https://github.com/Diego-8520"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 text-ink-muted hover:text-signal transition-colors"
              >
                <GithubIcon className="h-4 w-4 mt-0.5 text-signal flex-none" />
                <div>
                  <p className="font-mono text-[11px] text-ink-muted">GitHub</p>
                  <p className="font-body text-sm font-medium text-ink group-hover:text-signal">
                    github.com/Diego-8520
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className="border border-line bg-paper/60 p-6 space-y-3 font-mono text-xs text-ink-muted">
            <div className="flex items-center gap-2 text-ink">
              <MapPin size={14} className="text-signal" />
              <span>Cali, Valle del Cauca, Colombia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-signal" />
              <span>Zona horaria: GMT-5 (COT)</span>
            </div>
            <p className="text-[11px] pt-2 border-t border-line/60">
              Disponible para puestos remotos a nivel global y proyectos independientes.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
