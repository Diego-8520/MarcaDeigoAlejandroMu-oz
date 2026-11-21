"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogIn } from "lucide-react";
import { useMotion } from "@/components/motion/gsap";
import { useLenis } from "@/components/motion/motion-provider";
import { CONTACT, NAV_ITEMS, isActivePath } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/brand-mark";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Menú en panel lateral (máx. media pantalla) con rutas en cascada y el sello
 * de marca al pie. Un clic en el fondo atenuado lo cierra.
 * Diálogo modal accesible: atrapa el foco, se cierra con Esc y devuelve el foco.
 */
export function SiteMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = NAV_ITEMS.findIndex((item) => isActivePath(pathname, item.href));
  const previewIndex = hovered ?? (activeIndex >= 0 ? activeIndex : 0);

  // Bloquear scroll y gestionar foco/teclado mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    root?.querySelector<HTMLElement>("[data-menu-first]")?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, lenis]);

  useMotion(
    ({ gsap }) => {
      const root = rootRef.current;
      if (!root || !open) return;
      gsap
        .timeline()
        .from("[data-menu-backdrop]", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
        .from("[data-menu-panel]", { xPercent: 100, duration: 0.8, ease: "expo.out" }, 0)
        .from("[data-menu-link]", { yPercent: 110, duration: 0.8, stagger: 0.04 }, 0.2)
        .from("[data-menu-meta]", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.05 }, 0.4);
    },
    [open],
    { scope: rootRef },
  );

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      className="fixed inset-0 z-50"
    >
      {/* Fondo atenuado: el sitio sigue visible detrás y un clic fuera cierra. */}
      <div
        data-menu-backdrop
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      {/* Panel lateral: ancho completo en móvil, como máximo media pantalla en escritorio. */}
      <div
        data-menu-panel
        className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-line bg-paper sm:w-[min(30rem,85vw)] lg:w-[min(34rem,50vw)]"
      >
        {/* Filo de acento */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-signal" />

        <div className="flex h-[var(--header-h)] flex-none items-center justify-between px-6 sm:px-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Índice <span className="text-ink">/ {NAV_ITEMS.length.toString().padStart(2, "0")}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            data-menu-first
            className="tap font-mono text-[11px] uppercase tracking-[0.08em] text-ink hover:text-signal"
          >
            Cerrar <span className="text-ink-subtle">[esc]</span>
          </button>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 px-6 sm:px-8">
          <ul onMouseLeave={() => setHovered(null)} className="flex flex-col">
            {NAV_ITEMS.map((item, i) => {
              const active = isActivePath(pathname, item.href);
              const dimmed = hovered !== null && hovered !== i;
              return (
                <li key={item.href} className="overflow-hidden border-b border-line first:border-t">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    aria-current={active ? "page" : undefined}
                    data-menu-link
                    className={cn(
                      "group flex items-baseline gap-4 py-[clamp(0.35rem,1.1vh,0.75rem)] transition-opacity duration-500",
                      dimmed ? "opacity-30" : "opacity-100",
                    )}
                  >
                    <span className="w-7 flex-none font-mono text-[11px] text-ink-subtle">{item.index}</span>
                    {/* Tamaño ligado a la altura: las 8 rutas caben sin desplazarse. */}
                    <span
                      className={cn(
                        "display stretch-hover text-[clamp(1.5rem,min(4.4vh,8vw),2.75rem)] leading-[1]",
                        active ? "text-signal" : "text-ink",
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.08em] text-signal">
                        Aquí
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p
            data-menu-meta
            aria-live="polite"
            className="mt-4 hidden min-h-[2.5em] font-serif text-lg italic leading-snug text-ink-muted sm:block"
          >
            {NAV_ITEMS[previewIndex].blurb}
          </p>
        </nav>

        <div className="flex-none space-y-5 px-6 pb-6 pt-6 sm:px-8">
          <ul data-menu-meta className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="link-draw tap inline-block min-w-11 text-ink">
                Correo
              </a>
            </li>
            <li>
              <a href={CONTACT.whatsappUrl()} target="_blank" rel="noreferrer" className="link-draw tap inline-flex items-center gap-1 text-ink">
                WhatsApp <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="link-draw tap inline-flex items-center gap-1 text-ink">
                LinkedIn <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={CONTACT.github} target="_blank" rel="noreferrer" className="link-draw tap inline-flex items-center gap-1 text-ink">
                GitHub <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </li>
          </ul>

          {/* Sello de marca, igual que el cierre del pie de página. */}
          <div data-menu-meta className="flex items-end justify-between gap-6 border-t border-line pt-5">
            <Link href="/" onClick={onClose} aria-label="DAM, Diego Alejandro Muñoz: volver al inicio" className="group tap-area">
              <BrandMark className="h-[clamp(3.5rem,9vh,5.5rem)] w-[clamp(3.5rem,9vh,5.5rem)] text-ink" />
            </Link>
            <div className="flex flex-col items-end gap-3">
              <p className="text-right font-mono text-[10px] uppercase leading-[1.7] tracking-[0.08em] text-ink-subtle">
                <span className="text-ink">DAM</span>
                <br />
                Diego Alejandro Muñoz
                <br />
                Software Developer · Cali
              </p>
              {/* Carga completa (no <Link>): el documento del login no hereda GTM del sitio público. */}
              <a href="/login" aria-label="Acceso administrativo privado" className="tap-area text-ink-subtle hover:text-ink">
                <LogIn size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
