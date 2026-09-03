import type { Metadata } from "next";
import { Section, Tag } from "@/components/ui/section";
import { services } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Servicios — Diego Alejandro Muñoz",
};

export default function ServiciosPage() {
  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">servicios</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Qué puedo construir para ti
      </h1>

      <div className="mt-10 space-y-10">
        {services.map((service) => (
          <div key={service.slug} className="border-t border-line pt-8 first:border-t-0 first:pt-0">
            <h2 className="font-display text-xl font-semibold text-ink">{service.name}</h2>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
              {service.description}
            </p>
            <p className="mt-3 font-mono text-xs text-ink-muted">
              resuelve: {service.solves}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {service.technologies.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <ul className="mt-4 space-y-1">
              {service.deliverables.map((d) => (
                <li key={d} className="font-body text-sm text-ink-muted">
                  — {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
