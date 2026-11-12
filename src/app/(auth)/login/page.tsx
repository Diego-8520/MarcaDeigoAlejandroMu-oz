import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NO_INDEX } from "@/lib/seo";
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
        <Link href="/" className="group flex items-baseline gap-2" aria-label="DAM: volver al sitio público">
          <span className="display text-xl text-ink">DAM</span>
          <span aria-hidden="true" className="h-2 w-2 bg-signal" />
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
