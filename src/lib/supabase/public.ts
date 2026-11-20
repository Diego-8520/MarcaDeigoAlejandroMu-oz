import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo sin cookies para lecturas públicas (contenido publicado).
 *
 * No lee la sesión del visitante, así que las páginas públicas pueden
 * prerenderizarse y revalidarse (ISR) en lugar de renderizarse en cada visita.
 * La RLS sigue aplicando: solo devuelve lo que el rol `anon` puede leer.
 * Para datos privados usar `createAdminClient` (servidor) o el cliente SSR.
 */
function createPublicClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * Ejecuta una lectura pública sin dejar que los datos rompan el build.
 *
 * Las páginas públicas se prerenderizan en `next build`, así que una variable
 * de Supabase ausente (p. ej. en un entorno de Preview de Vercel) o una caída
 * puntual de Supabase harían fallar todo el despliegue. Por eso:
 * - Sin variables configuradas → `fallback` (en build y en ejecución).
 * - Error durante el build → aviso y `fallback`; la página se completa en la
 *   primera revalidación (ISR).
 * - Error en ejecución → se relanza, para que Next siga sirviendo la última
 *   versión buena en caché en lugar de cachear una página vacía.
 */
export async function withPublicClient<T>(fallback: T, run: (supabase: SupabaseClient) => Promise<T>): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no configuradas: se usan datos vacíos.");
    return fallback;
  }

  try {
    return await run(createPublicClient(url, key));
  } catch (error) {
    if (!isBuildPhase()) throw error;
    console.warn("[supabase] Lectura pública fallida durante el build; se usan datos vacíos hasta la revalidación.", error);
    return fallback;
  }
}
