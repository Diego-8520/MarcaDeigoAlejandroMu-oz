import Link from "next/link";
import {
  getExternalResources,
  getIntegrationConnections,
  type ExternalResource,
} from "@/lib/data/external-resources-queries";

export const dynamic = "force-dynamic";

type Provider = ExternalResource["provider"];

const PROVIDERS = ["github", "vercel", "supabase"] as const satisfies readonly Provider[];

/** Cómo se llama cada recurso en su listado. */
const RESOURCE_LABEL: Record<Provider, { column: string; plural: string }> = {
  github: { column: "repositorio", plural: "repositorios" },
  vercel: { column: "proyecto", plural: "proyectos de Vercel" },
  supabase: { column: "proyecto", plural: "proyectos de Supabase" },
};

const buttonClass =
  "border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal";

function isProviderConfigured(provider: Provider, status: string | undefined) {
  if (provider === "vercel") return Boolean(process.env.VERCEL_API_TOKEN);
  if (provider === "supabase") return Boolean(process.env.SUPABASE_MANAGEMENT_TOKEN);
  return status === "connected";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default async function IntegracionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedProvider = typeof params.provider === "string" ? params.provider : "github";
  const provider: Provider =
    requestedProvider === "vercel" || requestedProvider === "supabase" ? requestedProvider : "github";

  const [connections, resources] = await Promise.all([
    getIntegrationConnections(),
    getExternalResources(provider),
  ]);
  const byProvider = new Map(connections.map((connection) => [connection.provider, connection]));

  const error = typeof params.error === "string" ? params.error : null;
  const connected = typeof params.connected === "string" ? params.connected : null;
  const synced = typeof params.synced === "string" ? params.synced : null;

  const current = byProvider.get(provider);
  const currentConfigured = isProviderConfigured(provider, current?.status);
  const lastSynced = formatDateTime(current?.last_synced_at);
  const labels = RESOURCE_LABEL[provider];

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / integraciones</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Integraciones</h1>
      <p className="mt-2 max-w-xl font-body text-sm text-ink-muted">
        Conecta GitHub, Vercel y Supabase, y revisa los recursos descubiertos antes de convertirlos en proyectos públicos.
      </p>

      {error && <p className="mt-6 border border-red-200 p-3 font-mono text-xs text-red-600">{error}</p>}
      {connected && <p className="mt-6 border border-line p-3 font-mono text-xs text-signal">{connected} conectado.</p>}
      {synced && (
        <p className="mt-6 border border-line p-3 font-mono text-xs text-signal">
          {synced} {labels.plural} sincronizados.
        </p>
      )}

      {/* Conexiones: estado y cuenta de cada proveedor. */}
      <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
        {PROVIDERS.map((item) => {
          const connection = byProvider.get(item);
          const isConfigured = isProviderConfigured(item, connection?.status);
          return (
            <section key={item} className="bg-paper p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink">{item}</h2>
                <span className="font-mono text-[11px] text-ink-muted">
                  {isConfigured ? "conectado" : connection?.status === "error" ? "requiere reconexión" : "pendiente"}
                </span>
              </div>
              <p className="mt-3 min-h-10 font-mono text-xs text-ink-muted">
                {connection?.account_label ?? "Sin cuenta sincronizada."}
              </p>
              {connection?.sync_error && (
                <p className="mt-2 font-mono text-[11px] text-red-600">{connection.sync_error}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {item === "github" && (
                  <Link href="/api/integrations/github/connect" className={buttonClass}>
                    {isConfigured ? "reconectar" : "conectar"}
                  </Link>
                )}
                <Link href={`/dashboard/integraciones?provider=${item}`} className={buttonClass}>
                  ver recursos
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* Recursos descubiertos, por proveedor. */}
      <h2 className="mt-12 font-display text-lg font-semibold text-ink">Recursos externos</h2>
      <p className="mt-1 max-w-xl font-body text-sm text-ink-muted">
        Recursos descubiertos que todavía requieren una decisión editorial.
      </p>
      <nav className="mt-6 flex gap-4 border-b border-line font-mono text-xs">
        {PROVIDERS.map((item) => (
          <Link
            key={item}
            href={`/dashboard/integraciones?provider=${item}`}
            className={`pb-2 ${provider === item ? "border-b border-signal text-signal" : "text-ink-muted"}`}
          >
            {item}
          </Link>
        ))}
      </nav>

      {/* Barra del listado: sincronizar queda justo encima de los recursos de este proveedor. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-ink-muted">
          {resources.length} {labels.plural}
          {lastSynced ? ` · última sincronización: ${lastSynced}` : " · sin sincronizar todavía"}
        </p>
        {currentConfigured ? (
          <form action={`/api/integrations/${provider}/sync`} method="post">
            <button type="submit" className={buttonClass}>
              sincronizar {provider}
            </button>
          </form>
        ) : provider === "github" ? (
          <Link href="/api/integrations/github/connect" className={buttonClass}>
            conectar github para sincronizar
          </Link>
        ) : (
          <p className="font-mono text-[11px] text-ink-muted">
            Falta {provider === "vercel" ? "VERCEL_API_TOKEN" : "SUPABASE_MANAGEMENT_TOKEN"} en el servidor.
          </p>
        )}
      </div>

      <div className="mt-4 overflow-x-auto border-y border-line">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-xs text-ink-muted">
              <th className="py-3 pr-4 font-normal">{labels.column}</th>
              <th className="px-4 py-3 font-normal">visibilidad</th>
              <th className="px-4 py-3 font-normal">actualizado</th>
              <th className="px-4 py-3 font-normal">estado</th>
              <th className="py-3 pl-4 font-normal">acciones</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => {
              const payload = resource.payload as {
                url?: string;
                pushedAt?: string | null;
                primaryLanguage?: string | null;
                fork?: boolean;
                archived?: boolean;
                deployment?: { url?: string | null; state?: string | null };
              };
              return (
                <tr key={resource.id} className="border-b border-line last:border-b-0">
                  <td className="py-4 pr-4">
                    <p className="font-body text-sm text-ink">
                      {resource.ownerLabel}/{resource.name}
                    </p>
                    <p className="mt-1 max-w-md font-body text-xs text-ink-muted">
                      {resource.description ?? "Sin descripción."}
                    </p>
                    {payload.primaryLanguage && (
                      <p className="mt-1 font-mono text-[11px] text-ink-muted">
                        {payload.primaryLanguage}
                        {payload.fork ? " · fork" : ""}
                        {payload.archived ? " · archivado" : ""}
                      </p>
                    )}
                    {payload.deployment?.state && (
                      <p className="mt-1 font-mono text-[11px] text-ink-muted">deployment: {payload.deployment.state}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">{resource.visibility ?? "desconocida"}</td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                    {payload.pushedAt ? new Date(payload.pushedAt).toLocaleDateString("es-CO") : "sin datos"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">{resource.availability}</td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      {(payload.url || payload.deployment?.url) && (
                        <a
                          href={payload.url ?? `https://${payload.deployment?.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-signal hover:underline"
                        >
                          ver
                        </a>
                      )}
                      {provider === "github" && resource.availability !== "ignored" && (
                        <form action="/api/integrations/github/import" method="post">
                          <input type="hidden" name="resource_id" value={resource.id} />
                          <button type="submit" className="font-mono text-xs text-signal hover:underline">
                            importar
                          </button>
                        </form>
                      )}
                      {provider === "github" && (
                        <form action="/api/integrations/github/ignore" method="post">
                          <input type="hidden" name="resource_id" value={resource.id} />
                          <button type="submit" className="font-mono text-xs text-ink-muted hover:text-ink">
                            ignorar
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {resources.length === 0 && (
        <p className="mt-6 font-body text-sm text-ink-muted">Sin recursos sincronizados para este proveedor.</p>
      )}
    </div>
  );
}
