"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMotion } from "@/components/motion/gsap";

export interface Capability {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  deliverables: string[];
  stack: string[];
}

/**
 * Capacidades como paneles en scroll horizontal anclado (desde lg).
 * En pantallas pequeñas o con movimiento reducido se apilan en vertical.
 */
export function CapabilitiesPin({ items }: { items: Capability[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.to("[data-cap-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });
      return () => mm.revert();
    },
    [],
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative overflow-hidden lg:flex lg:h-[100dvh] lg:flex-col lg:justify-center">
      <div className="container-x mb-10 flex items-end justify-between gap-6 lg:mb-12">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
          <span className="text-signal">03</span>
          <span className="text-ink-muted">Qué puedo construir para ti</span>
        </div>
        <Link href="/servicios" className="link-draw hidden font-mono text-[11px] uppercase tracking-[0.08em] text-ink sm:inline">
          Servicios y entregables
        </Link>
      </div>

      <div ref={trackRef} className="flex flex-col gap-px bg-line lg:w-max lg:flex-row lg:bg-transparent lg:pl-[var(--gutter)]">
        {items.map((cap, i) => (
          <article
            key={cap.id}
            className="flex flex-col justify-between gap-10 bg-paper px-[var(--gutter)] py-12 lg:h-[68vh] lg:w-[min(78vw,72rem)] lg:border-l lg:border-line lg:px-12 lg:py-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <span className="display text-[clamp(5rem,14vw,13rem)] leading-[0.8] text-signal lg:col-span-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="lg:col-span-8">
                <p className="eyebrow">{cap.eyebrow}</p>
                <h3 className="display display-sm mt-4 text-ink">{cap.title}</h3>
                <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-ink-muted">{cap.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-12">
              <ul className="space-y-2 text-sm text-ink lg:col-span-6">
                {cap.deliverables.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span aria-hidden="true" className="font-mono text-signal">+</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col justify-between gap-6 lg:col-span-6 lg:items-end">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">{cap.stack.join(" · ")}</p>
                <Link
                  href={`/contacto?motivo=servicio&servicio=${cap.id}`}
                  className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-ink"
                >
                  <span className="link-draw">Cotizar este servicio</span>
                  <ArrowRight aria-hidden="true" size={14} className="transition-transform duration-500 ease-expo group-hover:translate-x-1 text-signal" />
                </Link>
              </div>
            </div>
          </article>
        ))}
        <div aria-hidden="true" className="hidden lg:block lg:w-[var(--gutter)]" />
      </div>

      <div className="container-x mt-10 hidden lg:block">
        <div className="h-px w-full bg-line">
          <div data-cap-progress className="h-px w-full origin-left scale-x-0 bg-signal" />
        </div>
      </div>
    </div>
  );
}
