"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const DASHBOARD_ITEMS = [
  { href: "/dashboard", label: "General" },
  { href: "/dashboard/proyectos", label: "Proyectos" },
  { href: "/dashboard/recursos-externos", label: "Recursos externos" },
  { href: "/dashboard/integraciones", label: "Integraciones" },
  { href: "/dashboard/experiencia", label: "Experiencia" },
  { href: "/dashboard/educacion", label: "Educación" },
  { href: "/dashboard/skills", label: "Skills" },
  { href: "/dashboard/cv", label: "CV" },
  { href: "/dashboard/perfil", label: "Perfil" },
  { href: "/dashboard/testimonios", label: "Testimonios" },
  { href: "/dashboard/contactos", label: "Contactos" },
];

function Brand() {
  return (
    <Link href="/" className="group flex items-baseline gap-2" aria-label="Ir a la web pública">
      <span className="display text-lg text-ink">DAM</span>
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal transition-transform duration-500 group-hover:rotate-45" />
    </Link>
  );
}

/** Navegación del panel: riel con índice numerado en escritorio y desplegable en móvil. */
export function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
  const current = DASHBOARD_ITEMS.find((i) => isActive(i.href));

  return (
    <>
      {/* Barra superior móvil */}
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-4">
          <Brand />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">/ {current?.label ?? "Panel"}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="dashboard-mobile-nav"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink hover:text-signal"
        >
          {mobileOpen ? "Cerrar" : "Menú"}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="dashboard-mobile-nav"
          aria-label="Menú del panel"
          className="fixed inset-x-0 top-[49px] z-30 border-b border-line bg-paper px-4 py-4 lg:hidden"
        >
          <ul className="grid grid-cols-2 gap-px bg-line">
            {DASHBOARD_ITEMS.map((item, i) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-baseline gap-2 px-3 py-3 font-mono text-xs transition-colors",
                      active ? "bg-signal text-signal-ink" : "bg-paper text-ink hover:bg-surface",
                    )}
                  >
                    <span className={active ? "text-signal-ink/60" : "text-ink-subtle"}>{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Riel de escritorio */}
      <aside className="hidden min-h-screen w-60 flex-none flex-col justify-between border-r border-line px-6 py-8 lg:flex">
        <div>
          <Brand />
          <p className="eyebrow mt-3">Panel de administración</p>
          <nav className="mt-10" aria-label="Menú del panel">
            <ul className="border-t border-line">
              {DASHBOARD_ITEMS.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="border-b border-line">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-baseline gap-3 py-2.5 font-mono text-xs transition-colors",
                        active ? "text-signal" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      <span className={cn("w-5 text-[10px]", active ? "text-signal" : "text-ink-subtle")}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">{item.label}</span>
                      {active && <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={13} />
          Ir a la web pública
        </Link>
      </aside>
    </>
  );
}
