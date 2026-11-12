import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo sin cookies para lecturas públicas (contenido publicado).
 *
 * No lee la sesión del visitante, así que las páginas públicas pueden
 * prerenderizarse y revalidarse (ISR) en lugar de renderizarse en cada visita.
 * La RLS sigue aplicando: solo devuelve lo que el rol `anon` puede leer.
 * Para datos privados usar `createAdminClient` (servidor) o el cliente SSR.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
