import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contacto — Diego Alejandro Muñoz",
};

export default function ContactoPage() {
  return (
    <Section className="pt-16 pb-24 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">contacto</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Hablemos de tu proyecto
      </h1>
      <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-ink-muted">
        Cuéntame si buscas contratar a un profesional o si necesitas un
        servicio. Respondo personalmente cada mensaje.
      </p>
      <ContactForm />
    </Section>
  );
}
