import {
  getExternalResources,
  type ExternalResource,
} from "@/lib/data/external-resources-queries";

export const dynamic = "force-dynamic";

export default async function RecursosExternosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedProvider =
    typeof params.provider === "string" ? params.provider : "github";
  const provider: ExternalResource["provider"] =
    requestedProvider === "vercel" || requestedProvider === "supabase"
      ? requestedProvider
      : "github";
  const resources = await getExternalResources(provider);
  const error = typeof params.error === "string" ? params.error : null;
  const synced = typeof params.synced === "string" ? params.synced : null;

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">
        dashboard / recursos externos
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Recursos externos
      </h1>
      <p className="mt-2 max-w-xl font-body text-sm text-ink-muted">
        Recursos descubiertos que todavía requieren una decisión editorial.
      </p>
      <nav className="mt-6 flex gap-4 border-b border-line font-mono text-xs">
        {(["github", "vercel", "supabase"] as const).map((item) => (
          <a
            key={item}
            href={`/dashboard/recursos-externos?provider=${item}`}
            className={`pb-2 ${provider === item ? "border-b border-signal text-signal" : "text-ink-muted"}`}
          >
            {item}
          </a>
        ))}
      </nav>
      {error && (
        <p className="mt-6 border border-red-200 p-3 font-mono text-xs text-red-600">
          {error}
        </p>
      )}
      {synced && (
        <p className="mt-6 border border-line p-3 font-mono text-xs text-signal">
          {synced} repositorios sincronizados.
        </p>
      )}

      <div className="mt-8 overflow-x-auto border-y border-line">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-xs text-ink-muted">
              <th className="py-3 pr-4 font-normal">repositorio</th>
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
                <tr
                  key={resource.id}
                  className="border-b border-line last:border-b-0"
                >
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
                      <p className="mt-1 font-mono text-[11px] text-ink-muted">
                        deployment: {payload.deployment.state}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                    {resource.visibility ?? "desconocida"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                    {payload.pushedAt
                      ? new Date(payload.pushedAt).toLocaleDateString("es-CO")
                      : "sin datos"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                    {resource.availability}
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      {(payload.url || payload.deployment?.url) && (
                        <a
                          href={
                            payload.url ?? `https://${payload.deployment?.url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-signal hover:underline"
                        >
                          ver
                        </a>
                      )}
                      {provider === "github" &&
                        resource.availability !== "ignored" && (
                          <form
                            action="/api/integrations/github/import"
                            method="post"
                          >
                            <input
                              type="hidden"
                              name="resource_id"
                              value={resource.id}
                            />
                            <button
                              type="submit"
                              className="font-mono text-xs text-signal hover:underline"
                            >
                              importar
                            </button>
                          </form>
                        )}
                      {provider === "github" && (
                        <form
                          action="/api/integrations/github/ignore"
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="resource_id"
                            value={resource.id}
                          />
                          <button
                            type="submit"
                            className="font-mono text-xs text-ink-muted hover:text-ink"
                          >
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
        <p className="mt-6 font-body text-sm text-ink-muted">
          Sin recursos sincronizados para este proveedor.
        </p>
      )}
    </div>
  );
}
