import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NO_INDEX } from "@/lib/seo";
import { BrandMark } from "@/components/brand/brand-mark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: NO_INDEX,
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[100dvh] grid-cols-1 bg-paper lg:grid-cols-2">
      {/* Panel editorial (solo escritorio) */}
      <div className="relative hidden flex-col justify-between border-r border-line p-12 lg:flex">
        <Link href="/" className="group flex items-center gap-3" aria-label="DAM: volver al sitio público">
          <BrandMark className="h-[30px] w-[30px] text-ink" />
          <span aria-hidden="true" className="h-7 w-px bg-line-focus" />
          <span className="flex flex-col font-mono text-[10px] uppercase leading-[1.4] tracking-[0.08em]">
            <span className="text-ink">Diego Alejandro Muñoz</span>
            <span className="text-ink-subtle">Volver al sitio</span>
          </span>
        </Link>
        <p className="display text-[clamp(3rem,6vw,6.5rem)] text-ink">
          Panel <span className="font-serif">privado</span>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">Acceso restringido · Supabase Auth</p>
      </div>

      <div className="flex items-center justify-center px-[var(--gutter)] py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink lg:hidden"
          >
            <ArrowLeft aria-hidden="true" size={13} />
            Sitio público
          </Link>
          <p className="eyebrow text-signal">Dashboard</p>
          <h1 className="display mt-3 text-4xl text-ink">Iniciar sesión</h1>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
