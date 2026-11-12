"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AudienceSwitch } from "./audience-switch";
import { CaliClock } from "./cali-clock";
import { SiteMenu } from "./site-menu";
import { cn } from "@/lib/utils";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Barra superior mínima. Se oculta al bajar y reaparece al subir.
 * El header se ancla durante las view transitions (`site-header`).
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Scroll nativo (Lenis también mueve el scroll de la ventana): sin GSAP
  // en el JavaScript inicial. Una lectura por frame como máximo.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y !== lastY) setHidden(y > lastY && y > 320);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Atajo "/" para abrir o cerrar el menú.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      setMenuOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-signal focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-signal-ink"
      >
        Saltar al contenido
      </a>
      <header
        ref={headerRef}
        style={{ viewTransitionName: "site-header" }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[transform,background-color,border-color] duration-500 ease-expo",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link href="/" aria-label="Diego Alejandro Muñoz, ir al inicio" className="tap-area group flex items-baseline gap-2">
            <span className="display stretch-hover text-xl text-ink">DAM</span>
            <span aria-hidden="true" className="h-2 w-2 bg-signal transition-transform duration-500 ease-expo group-hover:rotate-45" />
          </Link>

          <div className="hidden items-center gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink md:flex">
            <CaliClock />
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald" />
              Disponible
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <AudienceSwitch className="hidden sm:flex" />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="tap group flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink"
            >
              <span>Menú</span>
              <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
                <span className="h-px w-full bg-current transition-transform duration-500 ease-expo group-hover:scale-x-75" />
                <span className="h-px w-full origin-right bg-current transition-transform duration-500 ease-expo group-hover:scale-x-50" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <SiteMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
