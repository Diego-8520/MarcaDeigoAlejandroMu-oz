import Link from "next/link";
import {
  getTopPages,
  getTopProjects,
  getTopReferrers,
  getVisitsByCountry,
  getVisitsByDevice,
  getVisitsTimeSeries,
} from "@/lib/data/analytics-queries";
import type {
  AnalyticsCount,
  TimeSeriesPoint,
} from "@/lib/data/analytics-queries";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const CHART_PADDING = 24;

function parseRange(value: string | string[] | undefined) {
  const candidate = Number(Array.isArray(value) ? value[0] : value);
  return RANGES.includes(candidate as (typeof RANGES)[number]) ? candidate : 30;
}

function formatNumber(value: number) {
  return value.toLocaleString("es-ES");
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

function getChartPoints(series: TimeSeriesPoint[]) {
  const maxVisits = Math.max(...series.map((point) => point.visits), 1);
  const innerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING * 2;

  return series
    .map((point, index) => {
      const x =
        CHART_PADDING + (index / Math.max(series.length - 1, 1)) * innerWidth;
      const y =
        CHART_HEIGHT - CHART_PADDING - (point.visits / maxVisits) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function BarList({ items }: { items: AnalyticsCount[] }) {
  const maxVisits = Math.max(...items.map((item) => item.visits), 1);

  if (items.length === 0) {
    return (
      <p className="font-mono text-xs text-ink-muted">
        sin datos en este periodo
      </p>
    );
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        >
          <div className="min-w-0">
            <p
              className="truncate font-mono text-xs text-ink"
              title={item.label}
            >
              {item.label}
            </p>
            <div className="mt-2 h-1 bg-line">
              <div
                className="h-full bg-signal"
                style={{ width: `${(item.visits / maxVisits) * 100}%` }}
              />
            </div>
          </div>
          <p className="font-mono text-xs text-ink-muted">
            {formatNumber(item.visits)}
          </p>
        </div>
      ))}
    </div>
  );
}

function VisitsChart({ series }: { series: TimeSeriesPoint[] }) {
  if (series.length === 0) {
    return (
      <p className="font-mono text-xs text-ink-muted">
        sin datos en este periodo
      </p>
    );
  }

  const points = getChartPoints(series);
  const first = series[0];
  const middle = series[Math.floor((series.length - 1) / 2)];
  const last = series[series.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Tendencia de visitas"
      >
        <line
          x1={CHART_PADDING}
          x2={CHART_WIDTH - CHART_PADDING}
          y1={CHART_HEIGHT - CHART_PADDING}
          y2={CHART_HEIGHT - CHART_PADDING}
          stroke="currentColor"
          className="text-line"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-signal"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-ink-muted">
        <span>{formatDay(first.day)}</span>
        {middle && <span>{formatDay(middle.day)}</span>}
        <span>{formatDay(last.day)}</span>
      </div>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const days = parseRange(params.range);
  const [series, referrers, countries, devices, pages, projects] =
    await Promise.all([
      getVisitsTimeSeries(days),
      getTopReferrers(days, 8),
      getVisitsByCountry(days),
      getVisitsByDevice(days),
      getTopPages(days, 8),
      getTopProjects(days, 8),
    ]);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-ink-muted">
            dashboard / analytics
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Analytics
          </h1>
          <p className="mt-2 font-body text-sm text-ink-muted">
            Tráfico propio registrado en el sitio.
          </p>
        </div>
        <nav
          className="flex border border-line font-mono text-xs"
          aria-label="Rango de tiempo"
        >
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/dashboard/analytics?range=${range}`}
              className={`border-r border-line px-3 py-2 last:border-r-0 ${
                days === range
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:text-signal"
              }`}
            >
              {range}d
            </Link>
          ))}
        </nav>
      </div>

      <section className="mt-10 border-y border-line py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-mono text-sm text-ink">Tendencia de visitas</h2>
          <span className="font-mono text-xs text-ink-muted">{days} días</span>
        </div>
        <div className="mt-6">
          <VisitsChart series={series} />
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-mono text-sm text-ink">De dónde vienen</h2>
          <BarList items={referrers} />
        </section>
        <section>
          <h2 className="mb-4 font-mono text-sm text-ink">Países</h2>
          <BarList items={countries} />
        </section>
        <section>
          <h2 className="mb-4 font-mono text-sm text-ink">Dispositivos</h2>
          <BarList items={devices} />
        </section>
        <section>
          <h2 className="mb-4 font-mono text-sm text-ink">
            Páginas más vistas
          </h2>
          <BarList items={pages} />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-mono text-sm text-ink">
          Proyectos más vistos
        </h2>
        {projects.length === 0 ? (
          <p className="font-mono text-xs text-ink-muted">
            sin datos en este periodo
          </p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {projects.map((project) => (
              <div
                key={project.projectId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <Link
                  href={`/dashboard/proyectos/${project.projectId}/editar`}
                  className="font-mono text-xs text-signal hover:underline"
                >
                  {project.title}
                </Link>
                <span className="font-mono text-xs text-ink-muted">
                  {formatNumber(project.visits)} visitas
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
