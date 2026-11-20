import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Exige una sesión válida cuyo email esté en ADMIN_EMAILS.
 * Úsalo en toda Server Action o Route Handler del panel antes de usar la
 * service role.
 */
export async function requireDashboardUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminEmail(user.email)) {
    throw new Error("No autorizado.");
  }

  return user;
}

export const requireAdmin = requireDashboardUser;
