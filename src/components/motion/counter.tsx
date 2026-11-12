"use client";

import { useRef } from "react";
import { useMotion } from "./gsap";

/** Número que cuenta desde 0 al entrar en vista. El valor final ya llega renderizado desde el servidor. */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotion(({ gsap }) => {
    const el = ref.current;
    if (!el || value === 0) return;
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
    return () => {
      el.textContent = `${value}${suffix}`;
    };
  }, [value, suffix], { trigger: ref });

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
