"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogIn,
  Briefcase,
  FileText,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useAudience } from "./audience-context";

const NAV_ITEMS = [
  { href: "/", label: "inicio" },
  { href: "/proyectos", label: "proyectos & código" },
  { href: "/servicios", label: "servicios para clientes" },
  { href: "/experiencia", label: "trayectoria & formación" },
  { href: "/sobre-mi", label: "sobre diego" },
  { href: "/cv", label: "hoja de vida (cv)" },
  { href: "/arquitectura", label: "arquitectura del sitio" },
  { href: "/contacto", label: "contacto directo" },
];

export function SiteRail() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, setMode } = useAudience();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Riel lateral fijo — Desktop (lg+) */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-line lg:bg-surface/60 lg:backdrop-blur-md lg:px-6 lg:py-8 z-30">
        <div>
          {/* Identidad */}
          <Link href="/" className="block group">
            <span className="font-display text-lg font-semibold leading-tight text-ink transition-colors group-hover:text-signal">
              Diego Alejandro
              <br />
              Muñoz
            </span>
          </Link>
          <p className="mt-1.5 font-mono text-[11px] tracking-tight text-ink-muted leading-tight">
            software developer
            <br />
            <span className="text-signal-light font-medium">web apps & automatización</span>
          </p>

          {/* Segmentación de contexto: Empresa / Recruiter vs Cliente / Proyecto */}
          <div className="mt-6 border border-line/80 bg-paper/60 p-1 rounded-sm">
            <p className="px-2 py-1 font-mono text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
              Tu objetivo de visita:
            </p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                type="button"
                onClick={() => setMode(mode === "recruiter" ? "all" : "recruiter")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 font-mono text-[11px] rounded-sm transition-all select-none ${
                  mode === "recruiter"
                    ? "bg-signal text-white font-medium shadow-sm"
                    : "text-ink-muted hover:text-ink hover:bg-surface-elevated"
                }`}
                title="Modo Reclutador / Empresa: Resalta código, GitHub, experiencia y CV"
              >
                <Building2 size={12} />
                <span>Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === "client" ? "all" : "client")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 font-mono text-[11px] rounded-sm transition-all select-none ${
                  mode === "client"
                    ? "bg-emerald text-white font-medium shadow-sm"
                    : "text-ink-muted hover:text-ink hover:bg-surface-elevated"
                }`}
                title="Modo Cliente / Proyecto: Resalta soluciones, entregables y cotizaciones"
              >
                <Briefcase size={12} />
                <span>Cliente</span>
              </button>
            </div>
          </div>

          {/* Atajo contextual según modo */}
          {mode === "recruiter" && (
            <div className="mt-3 p-2.5 border border-signal/30 bg-signal-dim rounded-sm">
              <p className="font-mono text-[10px] text-signal-light uppercase font-semibold">
                Ruta Recruiter activada
              </p>
              <Link
                href="/cv"
                className="mt-1.5 flex items-center justify-between font-mono text-xs text-ink hover:text-signal transition-colors font-medium"
              >
                <span>Descargar CV (PDF)</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {mode === "client" && (
            <div className="mt-3 p-2.5 border border-emerald/30 bg-emerald-dim rounded-sm">
              <p className="font-mono text-[10px] text-emerald uppercase font-semibold">
                Ruta Cliente activada
              </p>
              <Link
                href="/servicios"
                className="mt-1.5 flex items-center justify-between font-mono text-xs text-ink hover:text-emerald transition-colors font-medium"
              >
                <span>Ver servicios & cotizar</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Navegación vertical */}
          <nav className="mt-7 flex flex-col gap-0.5" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-baseline gap-2.5 py-1.5 px-2 font-mono text-xs rounded-sm transition-all ${
                    active
                      ? "text-ink font-semibold bg-surface-elevated border-l-2 border-signal"
                      : "text-ink-muted hover:text-ink hover:bg-surface-elevated/40"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 flex-none rounded-full transition-colors ${
                      active ? "bg-signal" : "bg-line group-hover:bg-signal"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Riel */}
        <div className="font-mono text-[11px] text-ink-muted border-t border-line/60 pt-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
            </span>
            <span className="text-ink">Disponible para proyectos</span>
          </div>
          <p className="text-[10px] text-ink-subtle">Cali, Valle del Cauca, Colombia</p>

          <div className="mt-4 flex items-center justify-between text-[10px] text-ink-subtle">
            <span>© {new Date().getFullYear()} Diego Muñoz</span>
            <Link
              href="/login"
              aria-label="Acceso administrativo privado"
              title="Panel administrativo"
              className="text-ink-subtle/40 transition-colors hover:text-ink"
            >
              <LogIn aria-hidden="true" size={11} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Header móvil / tablet */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-3 backdrop-blur-md lg:hidden">
        <Link
          href="/"
          className="font-display text-base font-semibold text-ink"
          onClick={() => setMobileMenuOpen(false)}
        >
          Diego Alejandro Muñoz
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href="/cv"
            className="border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-ink transition-colors hover:border-signal hover:text-signal flex items-center gap-1"
          >
            <FileText size={12} />
            <span>CV</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-ink hover:text-signal focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Alternar menú de navegación"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Drawer / Menú móvil expandible */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[49px] z-30 border-b border-line bg-surface/98 px-6 py-6 shadow-2xl backdrop-blur-lg lg:hidden">
          {/* Segmentación móvil */}
          <div className="mb-5 p-2 border border-line bg-paper/60 rounded-sm">
            <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-semibold mb-2">
              ¿Cuál es tu objetivo?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("recruiter");
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 font-mono text-xs rounded-sm text-center border transition-all ${
                  mode === "recruiter"
                    ? "bg-signal text-white border-signal font-medium"
                    : "border-line text-ink hover:border-signal"
                }`}
              >
                🏢 Contratar para Empresa
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("client");
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 font-mono text-xs rounded-sm text-center border transition-all ${
                  mode === "client"
                    ? "bg-emerald text-white border-emerald font-medium"
                    : "border-line text-ink hover:border-emerald"
                }`}
              >
                💼 Cotizar Proyecto
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-1 font-mono text-xs" aria-label="Navegación móvil">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-sm border-b border-line/40 transition-colors ${
                    active
                      ? "text-signal font-semibold bg-surface-elevated"
                      : "text-ink hover:text-signal"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex items-center justify-between font-mono text-xs text-ink-muted pt-3 border-t border-line">
            <span>Cali, Colombia · Disponible</span>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-ink-subtle hover:text-ink flex items-center gap-1 text-[11px]"
              aria-label="Acceso privado"
            >
              <LogIn size={11} />
              <span>panel</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
