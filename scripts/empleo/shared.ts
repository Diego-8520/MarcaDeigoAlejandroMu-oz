export function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

export function assertEnv() {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !process.env[k]);
  if (missing.length) {
    fail(`Faltan variables de entorno: ${missing.join(", ")}. Ejecuta desde la raíz del repo con tu .env.local.`);
  }
}
