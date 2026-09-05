import { createAdminClient } from "@/lib/supabase/admin";

export type MetricsSummary = {
  pageViews: number;
  uniqueSessions: number;
  projectViews: number;
  cvDownloads: number;
  contactSubmits: number;
};

export type AnalyticsCount = {
  label: string;
  visits: number;
};

export type TopProject = {
  projectId: string;
  title: string;
  visits: number;
};

export type TimeSeriesPoint = {
  day: string;
  visits: number;
};

type MetricsRow = {
  page_views: number;
  unique_sessions: number;
  project_views: number;
  cv_downloads: number;
  contact_submits: number;
};

type CountRow = {
  page?: string;
  source?: string;
  country?: string;
  device_type?: string;
  visits: number;
};

type ProjectRow = {
  project_id: string;
  title: string;
  visits: number;
};

type TimeSeriesRow = {
  day: string;
  visits: number;
};

function normalizedDays(days: number) {
  return Math.min(Math.max(Math.floor(days), 1), 3650);
}

function normalizedLimit(limit: number) {
  return Math.min(Math.max(Math.floor(limit), 1), 50);
}

function countValue(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export async function getMetricsSummary(days: number): Promise<MetricsSummary> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_analytics_metrics_summary", {
    p_days: normalizedDays(days),
  });

  if (error) throw error;
  const row = (data?.[0] ?? {}) as Partial<MetricsRow>;

  return {
    pageViews: countValue(row.page_views),
    uniqueSessions: countValue(row.unique_sessions),
    projectViews: countValue(row.project_views),
    cvDownloads: countValue(row.cv_downloads),
    contactSubmits: countValue(row.contact_submits),
  };
}

async function getCountRows(
  functionName: "get_analytics_top_pages" | "get_analytics_top_referrers",
  days: number,
  limit: number,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(functionName, {
    p_days: normalizedDays(days),
    p_limit: normalizedLimit(limit),
  });

  if (error) throw error;
  return (data ?? []) as CountRow[];
}

export async function getTopPages(
  days: number,
  limit: number,
): Promise<AnalyticsCount[]> {
  const rows = await getCountRows("get_analytics_top_pages", days, limit);
  return rows.map((row) => ({
    label: row.page ?? "desconocida",
    visits: countValue(row.visits),
  }));
}

export async function getTopReferrers(
  days: number,
  limit: number,
): Promise<AnalyticsCount[]> {
  const rows = await getCountRows("get_analytics_top_referrers", days, limit);
  return rows.map((row) => ({
    label: row.source ?? "directo",
    visits: countValue(row.visits),
  }));
}

export async function getVisitsByCountry(
  days: number,
): Promise<AnalyticsCount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_analytics_visits_by_country",
    {
      p_days: normalizedDays(days),
    },
  );

  if (error) throw error;
  return ((data ?? []) as CountRow[]).map((row) => ({
    label: row.country ?? "desconocido",
    visits: countValue(row.visits),
  }));
}

export async function getVisitsByDevice(
  days: number,
): Promise<AnalyticsCount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_analytics_visits_by_device", {
    p_days: normalizedDays(days),
  });

  if (error) throw error;
  return ((data ?? []) as CountRow[]).map((row) => ({
    label: row.device_type ?? "desconocido",
    visits: countValue(row.visits),
  }));
}

export async function getTopProjects(
  days: number,
  limit: number,
): Promise<TopProject[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_analytics_top_projects", {
    p_days: normalizedDays(days),
    p_limit: normalizedLimit(limit),
  });

  if (error) throw error;
  return ((data ?? []) as ProjectRow[]).map((row) => ({
    projectId: row.project_id,
    title: row.title,
    visits: countValue(row.visits),
  }));
}

export async function getVisitsTimeSeries(
  days: number,
): Promise<TimeSeriesPoint[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_analytics_visits_time_series",
    {
      p_days: normalizedDays(days),
    },
  );

  if (error) throw error;
  return ((data ?? []) as TimeSeriesRow[]).map((row) => ({
    day: row.day,
    visits: countValue(row.visits),
  }));
}
