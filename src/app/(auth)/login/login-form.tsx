"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "auth_failed"
      ? "No se pudo iniciar sesión con Google."
      : null,
  );
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    setIsPending(false);

    if (error) {
      setError("Credenciales incorrectas.");
      return;
    }

    router.push(searchParams.get("redirectTo") ?? "/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsGooglePending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setIsGooglePending(false);
      setError("No se pudo iniciar sesión con Google.");
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="font-mono text-xs text-ink-muted">
          correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>
      <div>
        <label htmlFor="password" className="font-mono text-xs text-ink-muted">
          contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink px-4 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
      >
        {isPending ? "verificando…" : "entrar"}
      </button>
      {error && <p className="font-mono text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3 py-1 font-mono text-[11px] text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        <span>o</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isPending || isGooglePending}
        className="flex w-full items-center justify-center gap-2 border border-line px-4 py-2.5 font-mono text-sm text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
      >
        <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.62-.06-1.22-.16-1.8H9v3.4h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.58Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.22l-2.92-2.26c-.8.54-1.82.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.68A5.4 5.4 0 0 1 3.69 9c0-.58.1-1.15.28-1.68V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.02l3.01-2.34Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.57-2.57C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.98l3.01 2.34c.71-2.12 2.69-3.74 5.03-3.74Z"
          />
        </svg>
        {isGooglePending ? "redireccionando..." : "continuar con Google"}
      </button>
    </form>
  );
}
