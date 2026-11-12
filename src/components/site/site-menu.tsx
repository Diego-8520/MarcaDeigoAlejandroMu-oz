"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogIn } from "lucide-react";
import { gsap, useGSAP, motionEnabled } from "@/components/motion/gsap";
import { useLenis } from "@/components/motion/motion-provider";
import { AudienceSwitch } from "./audience-switch";
import { CONTACT, NAV_ITEMS, isActivePath } from "@/lib/site";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Menú a pantalla completa. Cortina de acento + rutas gigantes en cascada.
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

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !open || !motionEnabled()) return;
      gsap
        .timeline()
        .fromTo(root, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" })
        .from("[data-menu-curtain]", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 0)
        .from("[data-menu-link]", { yPercent: 110, duration: 1, stagger: 0.045 }, 0.35)
        .from("[data-menu-meta]", { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.05 }, 0.55);
    },
    { scope: rootRef, dependencies: [open] },
  );

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper"
    >
      {/* Banda de acento que barre al abrir */}
      <div data-menu-curtain aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-signal" />

      <div className="container-x flex h-[var(--header-h)] flex-none items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Índice <span className="text-ink">/ {NAV_ITEMS.length.toString().padStart(2, "0")}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          data-menu-first
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink hover:text-signal"
        >
          Cerrar <span className="text-ink-subtle">[esc]</span>
        </button>
      </div>

      <div className="container-x grid flex-1 grid-cols-12 gap-x-6 pb-8 pt-4 lg:pt-8">
        <nav aria-label="Navegación principal" className="col-span-12 lg:col-span-8">
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
                      "group flex items-baseline gap-4 py-2 transition-opacity duration-500 sm:gap-6 sm:py-3",
                      dimmed ? "opacity-25" : "opacity-100",
                    )}
                  >
                    <span className="w-8 flex-none font-mono text-[11px] text-ink-subtle sm:w-10">{item.index}</span>
                    <span
                      className={cn(
                        "display stretch-hover text-[clamp(2.2rem,7.2vw,6.8rem)] leading-[0.95]",
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
        </nav>

        <aside className="col-span-12 mt-10 flex flex-col justify-between gap-10 lg:col-span-4 lg:mt-0 lg:pl-10">
          <div data-menu-meta aria-live="polite" className="hidden lg:block">
            <p className="eyebrow">{NAV_ITEMS[previewIndex].index} — Vista previa</p>
            <p className="mt-4 font-serif text-4xl italic leading-tight text-ink">{NAV_ITEMS[previewIndex].blurb}</p>
          </div>

          <div className="space-y-8">
            <div data-menu-meta>
              <p className="eyebrow mb-3">¿Qué buscas?</p>
              <AudienceSwitch size="lg" />
            </div>
            <ul data-menu-meta className="grid grid-cols-2 gap-y-2 font-mono text-xs">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="link-draw text-ink">
                  Correo
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsappUrl()} target="_blank" rel="noreferrer" className="link-draw inline-flex items-center gap-1 text-ink">
                  WhatsApp <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="link-draw inline-flex items-center gap-1 text-ink">
                  LinkedIn <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={CONTACT.github} target="_blank" rel="noreferrer" className="link-draw inline-flex items-center gap-1 text-ink">
                  GitHub <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </li>
            </ul>
            <div data-menu-meta className="flex items-center justify-between border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
              <span>Atajos: / menú · G rejilla</span>
              <Link href="/login" onClick={onClose} aria-label="Acceso administrativo privado" className="hover:text-ink">
                <LogIn size={12} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
