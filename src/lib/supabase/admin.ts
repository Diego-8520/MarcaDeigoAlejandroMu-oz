import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con SUPABASE_SERVICE_ROLE_KEY.
 * Uso EXCLUSIVO en el servidor (Route Handlers / Server Actions de confianza).
 * Nunca importar este archivo desde un componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
