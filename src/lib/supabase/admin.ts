import { createAdminClient as createSupabaseAdminClient } from "@supabase/server/core";

/**
 * Cliente con SUPABASE_SERVICE_ROLE_KEY.
 * Uso EXCLUSIVO en el servidor (Route Handlers / Server Actions de confianza).
 * Nunca importar este archivo desde un componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseAdminClient({
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKeys: { default: process.env.SUPABASE_SERVICE_ROLE_KEY! },
    },
  });
}
