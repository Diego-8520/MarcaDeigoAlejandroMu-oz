import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { CaliClock } from "@/components/site/cali-clock";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contacto: proyectos y empleo",
  description:
    "Escríbeme para cotizar un proyecto web o proponer una oportunidad laboral. Respondo en menos de 24 horas por correo, WhatsApp o el formulario.",
  path: "/contacto",
});

const CHANNELS = [
  { label: "Correo electrónico", value: CONTACT.email, href: `mailto:${CONTACT.email}`, external: false },
  { label: "WhatsApp directo", value: CONTACT.phoneDisplay, href: CONTACT.whatsappUrl("Hola Diego, vi tu perfil profesional y me gustaría conversar."), external: true },
  { label: "LinkedIn", value: CONTACT.linkedinHandle, href: CONTACT.linkedin, external: true },
  { label: "GitHub", value: `github.com/${CONTACT.githubHandle}`, href: CONTACT.github, external: true },
];

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        index="08"
        eyebrow="Canales de contacto"
        title={
          <>
            Iniciemos una <span className="font-serif">conversación</span>
          </>
        }
        lede="¿Tienes una propuesta laboral para tu equipo de ingeniería o necesitas desarrollar un producto web a medida? Cuéntame sobre ello. Respondo personalmente cada mensaje."
      />

      <section className="container-x border-t border-line py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-12 lg:gap-6">
          <aside className="space-y-12 lg:col-span-4">
            <div>
              <p className="eyebrow">Canales inmediatos</p>
              <ul className="mt-6 border-t border-line">
                {CHANNELS.map((c) => (
                  <li key={c.label} className="border-b border-line">
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="group flex items-center justify-between gap-4 py-5"
                    >
                      <span>
                        <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">{c.label}</span>
                        <span className="mt-1 block break-all text-lg text-ink transition-colors group-hover:text-signal">{c.value}</span>
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        size={18}
                        className="flex-none text-ink-muted transition-transform duration-500 ease-expo group-hover:rotate-45 group-hover:text-signal"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-2 gap-6 font-mono text-xs">
              <div>
                <dt className="eyebrow">Ubicación</dt>
                <dd className="mt-2 text-ink">Cali, Valle del Cauca</dd>
              </div>
              <div>
                <dt className="eyebrow">Zona horaria</dt>
                <dd className="mt-2 text-ink">
                  <CaliClock />
                </dd>
              </div>
              <div className="col-span-2 border-t border-line pt-4 text-ink-muted">
                Disponible para puestos remotos a nivel global y proyectos independientes.
              </div>
            </dl>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="eyebrow">Enviar un mensaje directo</p>
            <div className="mt-8">
              <Suspense fallback={<p className="font-mono text-xs text-ink-muted">Cargando formulario…</p>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
