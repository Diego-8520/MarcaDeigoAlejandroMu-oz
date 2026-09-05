import { getMetricsSummary } from "@/lib/data/analytics-queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getMetricsSummary(30);
  const metricItems = [
    { label: "visitas (30d)", value: metrics.pageViews },
    { label: "proyectos vistos", value: metrics.projectViews },
    { label: "cv descargado", value: metrics.cvDownloads },
    { label: "contactos nuevos", value: metrics.contactSubmits },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">General</h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Actividad registrada en los últimos 30 días.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {metricItems.map((m) => (
          <div key={m.label} className="bg-paper p-5">
            <p className="font-mono text-[11px] text-ink-muted">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
