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

/**
 * Espera a que la página termine de cargar y el navegador quede ocioso: el
 * coste de GSAP (descarga, SplitText, medición de ScrollTrigger) sale de la
 * ventana de carga. Si algo tarda, el CSS de respaldo muestra el contenido.
 */
function afterLoadIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () =>
      "requestIdleCallback" in window ? window.requestIdleCallback(() => resolve(), { timeout: 1200 }) : setTimeout(resolve, 200);
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  });
}

export function loadMotion(): Promise<Motion> {
  motionPromise ??= afterLoadIdle()
    .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]))
    .then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      g.gsap.defaults({ ease: "expo.out", duration: 1 });
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
    });
  return motionPromise;
}

/** Promesa de GSAP solo si algún componente ya lo pidió; si no, nunca resuelve. */
export function loadMotionIfStarted(): Promise<Motion> {
  return motionPromise ?? new Promise<Motion>(() => {});
}

export function loadSplitText(): Promise<typeof SplitTextType> {
  splitPromise ??= loadMotion().then(async (m) => {
    const s = await import("gsap/SplitText");
    m.gsap.registerPlugin(s.SplitText);
    return s.SplitText;
  });
  return splitPromise;
}

type Setup = (m: Motion) => void | (() => void);

type MotionOptions = {
  scope?: RefObject<Element | null>;
  /** Corre aunque el movimiento esté desactivado. */
  always?: boolean;
  /** Pide GSAP solo cuando este elemento se acerca al viewport. */
  trigger?: RefObject<Element | null>;
  /** Media query que debe cumplirse (p. ej. "(pointer: fine)"). */
  media?: string;
};

/** Resuelve cuando `el` está a menos de un tercio de pantalla de entrar en vista. */
function whenNear(el: Element): Promise<void> & { cancel: () => void } {
  let observer: IntersectionObserver | undefined;
  const promise = new Promise<void>((resolve) => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer?.disconnect();
          resolve();
        }
      },
      { rootMargin: "0px 0px 33% 0px" },
    );
    observer.observe(el);
  });
  return Object.assign(promise, { cancel: () => observer?.disconnect() });
}

/**
 * Efecto con GSAP diferido. Todo lo creado dentro de `setup` (tweens,
 * ScrollTriggers, SplitText, matchMedia) queda en un `gsap.context` y se
 * revierte al desmontar o al cambiar las dependencias.
 * Solo corre con movimiento activo, salvo `always: true`. Con `trigger`, una
 * página cuyo primer pantallazo no anima nada no descarga GSAP hasta el scroll.
 */
export function useMotion(setup: Setup, deps: DependencyList, opts: MotionOptions = {}) {
  useEffect(() => {
    if (!opts.always && !motionEnabled()) return;
    if (opts.media && !window.matchMedia(opts.media).matches) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    const target = opts.trigger?.current;
    const near = target ? whenNear(target) : undefined;
    (near ?? Promise.resolve())
      .then(() => loadMotion())
      .then((m) => {
        if (cancelled) return;
        ctx = m.gsap.context(() => setup(m), opts.scope?.current ?? undefined);
      });
    return () => {
      cancelled = true;
      near?.cancel();
      ctx?.revert();
    };
    // `setup` se redefine en cada render; las dependencias las declara quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
