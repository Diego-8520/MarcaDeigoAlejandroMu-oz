const METRICS = [
  { label: "visitas (30d)", value: "—" },
  { label: "proyectos vistos", value: "—" },
  { label: "cv descargado", value: "—" },
  { label: "contactos nuevos", value: "—" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">General</h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        {/* TODO: conectar con analytics_events (Fase 2) */}
        Las métricas se conectarán a la tabla <code className="font-mono">analytics_events</code> en la Fase 2.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-paper p-5">
            <p className="font-mono text-[11px] text-ink-muted">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
