"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextType } from "gsap/SplitText";

/**
 * GSAP se carga bajo demanda (import dinámico) después de la hidratación:
 * no forma parte del JavaScript inicial de ninguna ruta, así no compite con
 * el primer pintado ni con la interactividad. SplitText se descarga aparte,
 * solo cuando un componente lo pide.
 */

export type Motion = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType };

/** El movimiento solo corre si el script de arranque activó `js-motion`. */
export function motionEnabled() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("js-motion") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let motionPromise: Promise<Motion> | null = null;
let splitPromise: Promise<typeof SplitTextType> | null = null;

export function loadMotion(): Promise<Motion> {
  motionPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    g.gsap.defaults({ ease: "expo.out", duration: 1 });
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return motionPromise;
}

export function loadSplitText(): Promise<typeof SplitTextType> {
  splitPromise ??= Promise.all([loadMotion(), import("gsap/SplitText")]).then(([m, s]) => {
    m.gsap.registerPlugin(s.SplitText);
    return s.SplitText;
  });
  return splitPromise;
}

type Setup = (m: Motion) => void | (() => void);

/**
 * Efecto con GSAP diferido. Todo lo creado dentro de `setup` (tweens,
 * ScrollTriggers, SplitText, matchMedia) queda en un `gsap.context` y se
 * revierte al desmontar o al cambiar las dependencias.
 * Solo corre con movimiento activo, salvo `always: true`.
 */
export function useMotion(setup: Setup, deps: DependencyList, opts: { scope?: RefObject<Element | null>; always?: boolean } = {}) {
  useEffect(() => {
    if (!opts.always && !motionEnabled()) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    loadMotion().then((m) => {
      if (cancelled) return;
      ctx = m.gsap.context(() => setup(m), opts.scope?.current ?? undefined);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // `setup` se redefine en cada render; las dependencias las declara quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
