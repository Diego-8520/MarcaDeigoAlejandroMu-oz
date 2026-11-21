/**
 * Allowlist de administradores del panel.
 *
 * El login acepta email/contraseña y Google OAuth. Estar autenticado en
 * Supabase NO basta para entrar al panel: el email debe estar en
 * ADMIN_EMAILS (separados por comas). Si la variable no está definida, nadie
 * entra (falla cerrado).
 *
 * Sin dependencias de Node: se usa también desde src/proxy.ts.
 */
export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  raw: string | undefined | null = process.env.ADMIN_EMAILS,
): boolean {
  if (!email) return false;
  return parseAdminEmails(raw).includes(email.trim().toLowerCase());
}
