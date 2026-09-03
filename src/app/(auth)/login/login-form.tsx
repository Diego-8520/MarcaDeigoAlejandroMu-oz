"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
    </form>
  );
}
