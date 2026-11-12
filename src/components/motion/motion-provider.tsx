"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, motionEnabled } from "./gsap";

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

  useEffect(() => {
    if (!motionEnabled()) return;

    const instance = new Lenis({ lerp: 0.11, anchors: true });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setCurrent(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setCurrent(null);
    };
  }, []);

  // En cada navegación: volver arriba (salvo anclas) y recalcular triggers.
  useEffect(() => {
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <>{children}</>;
}
