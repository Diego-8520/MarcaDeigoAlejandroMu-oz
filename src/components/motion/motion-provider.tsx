"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { loadMotion, loadMotionIfStarted, motionEnabled } from "./gsap";

// Lenis es un sistema externo a React: se expone con un store mínimo.
let current: Lenis | null = null;
const listeners = new Set<() => void>();

function setCurrent(instance: Lenis | null) {
  current = instance;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Instancia de Lenis activa, o `null` con movimiento reducido o en servidor. */
export function useLenis() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

/**
 * Scroll suave (Lenis) sincronizado con el ticker de GSAP para que
 * ScrollTrigger lea la misma posición. Solo se monta en el sitio público.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useLenis();

  // Lenis y GSAP llegan después de la hidratación (import dinámico): el
  // scroll es nativo durante ese primer instante y luego se suaviza.
  useEffect(() => {
    // En táctil Lenis no suaviza (usa el scroll nativo): no se carga.
    if (!motionEnabled() || !window.matchMedia("(pointer: fine)").matches) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import("lenis"), loadMotion()]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const instance = new LenisCtor({ lerp: 0.11, anchors: true });
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setCurrent(instance);
      cleanup = () => {
        gsap.ticker.remove(tick);
        instance.destroy();
        setCurrent(null);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // En cada navegación: volver arriba (salvo anclas) y recalcular triggers.
  useEffect(() => {
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    if (!motionEnabled()) return;
    let id = 0;
    // Solo si GSAP ya se pidió en esta página; no fuerza su descarga.
    loadMotionIfStarted().then(({ ScrollTrigger }) => {
      id = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <>{children}</>;
}
