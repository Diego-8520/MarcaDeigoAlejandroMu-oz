"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";

const DASHBOARD_ITEMS = [
  { href: "/dashboard", label: "general" },
  { href: "/dashboard/proyectos", label: "proyectos" },
  { href: "/dashboard/recursos-externos", label: "recursos externos" },
  { href: "/dashboard/integraciones", label: "integraciones" },
  { href: "/dashboard/experiencia", label: "experiencia" },
  { href: "/dashboard/educacion", label: "educación" },
  { href: "/dashboard/skills", label: "skills" },
  { href: "/dashboard/cv", label: "cv" },
  { href: "/dashboard/perfil", label: "perfil" },
  { href: "/dashboard/testimonios", label: "testimonios" },
  { href: "/dashboard/contactos", label: "contactos" },
  { href: "/dashboard/analytics", label: "analytics" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Barra superior móvil para el dashboard */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden w-full">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-ink-muted hover:text-ink p-1"
            title="Volver a la web pública"
            aria-label="Volver a la web pública"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="font-mono text-xs font-semibold text-ink">
            admin / panel
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-ink hover:text-signal"
          aria-label="Alternar menú de dashboard"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[49px] z-30 border-b border-line bg-paper px-6 py-6 shadow-xl lg:hidden">
          <nav className="grid grid-cols-2 gap-2 font-mono text-xs">
            {DASHBOARD_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2 px-2.5 rounded border border-line/60 transition-colors ${
                    active
                      ? "bg-signal text-paper border-signal font-medium"
                      : "text-ink hover:border-signal hover:text-signal"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 pt-3 border-t border-line text-right">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-xs text-signal hover:underline"
            >
              ← Ir a la web pública
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden w-56 flex-none border-r border-line px-6 py-8 lg:flex lg:flex-col lg:justify-between min-h-screen">
        <div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-ink-muted font-medium">
              panel de administración
            </p>
          </div>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Menú del panel">
            {DASHBOARD_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1.5 font-mono text-sm transition-colors ${
                    active
                      ? "text-signal font-medium"
                      : "text-ink-muted hover:text-signal"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-line pt-4 font-mono text-xs text-ink-muted">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-signal transition-colors"
          >
            <ArrowLeft size={13} />
            <span>ir a la web pública</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
