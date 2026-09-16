import Link from "next/link";
import { getIntegrationConnections } from "@/lib/data/external-resources-queries";

export const dynamic = "force-dynamic";

const providers = ["github", "vercel", "supabase"] as const;

export default async function IntegracionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const connections = await getIntegrationConnections();
  const byProvider = new Map(
    connections.map((connection) => [connection.provider, connection]),
  );
  const error = typeof params.error === "string" ? params.error : null;
  const connected =
    typeof params.connected === "string" ? params.connected : null;

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">
        dashboard / integraciones
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Integraciones
          </h1>
          <p className="mt-2 max-w-xl font-body text-sm text-ink-muted">
            Conecta fuentes técnicas sin convertir repositorios descubiertos en
            proyectos públicos.
          </p>
        </div>
        <Link
          href="/dashboard/recursos-externos"
          className="font-mono text-xs text-signal hover:underline"
        >
          ver recursos externos
        </Link>
      </div>

      {error && (
        <p className="mt-6 border border-red-200 p-3 font-mono text-xs text-red-600">
          {error}
        </p>
      )}
      {connected && (
        <p className="mt-6 border border-line p-3 font-mono text-xs text-signal">
          {connected} conectado.
        </p>
      )}

      <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
        {providers.map((provider) => {
          const connection = byProvider.get(provider);
          const isGithub = provider === "github";
          const isConfigured =
            provider === "vercel"
              ? Boolean(process.env.VERCEL_API_TOKEN)
              : provider === "supabase"
                ? Boolean(process.env.SUPABASE_MANAGEMENT_TOKEN)
                : Boolean(connection?.status === "connected");
          return (
            <section key={provider} className="bg-paper p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {provider}
                </h2>
                <span className="font-mono text-[11px] text-ink-muted">
                  {isConfigured ? "conectado" : "pendiente"}
                </span>
              </div>
              <p className="mt-3 min-h-10 font-mono text-xs text-ink-muted">
                {connection?.account_label ?? "Sin cuenta sincronizada."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {isGithub ? (
                  <Link
                    href="/api/integrations/github/connect"
                    className="border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal"
                  >
                    {isConfigured ? "reconectar" : "conectar"}
                  </Link>
                ) : (
                  <form
                    action={`/api/integrations/${provider}/sync`}
                    method="post"
                  >
                    <button
                      type="submit"
                      className="border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal"
                    >
                      sincronizar
                    </button>
                  </form>
                )}
                {isGithub && isConfigured && (
                  <form action="/api/integrations/github/sync" method="post">
                    <button
                      type="submit"
                      className="border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal"
                    >
                      sincronizar
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
