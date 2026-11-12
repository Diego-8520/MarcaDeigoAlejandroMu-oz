"use client";

import { useRef } from "react";
import { gsap, useGSAP, motionEnabled } from "./gsap";

/** Número que cuenta desde 0 al entrar en vista. El valor final ya llega renderizado desde el servidor. */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !motionEnabled() || value === 0) return;
    const state = { n: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(state, {
      n: value,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: () => {
        el.textContent = `${Math.round(state.n)}${suffix}`;
      },
    });
  });

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
