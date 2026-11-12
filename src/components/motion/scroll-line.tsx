"use client";

import { useRef } from "react";
import { gsap, useGSAP, motionEnabled } from "./gsap";
import { cn } from "@/lib/utils";

/**
 * Regla vertical que se dibuja al ritmo del scroll dentro de su contenedor.
 * Colócala dentro de un elemento `relative`; sin movimiento se ve completa.
 */
export function ScrollLine({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !motionEnabled()) return;
    gsap.fromTo(
      el,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "bottom 60%", scrub: true },
      },
    );
  });

  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 left-0 w-px bg-line", className)}>
      <span ref={ref} className="block h-full w-full origin-top bg-signal" />
    </span>
  );
}
