import { createAdminClient } from "@/lib/supabase/admin";
import type { JobAnalysis, JobSourceId, Modality, NormalizedJob } from "@/lib/jobs/types";

import { type ApplicationStatus } from "@/lib/jobs/constants";

export { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/jobs/constants";

export type SavedJob = NormalizedJob & {
  id: string;
  createdAt: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  score: number | null;
  analysisVersion: number | null;
  cvFingerprint: string | null;
};

export type SavedJobWithAnalysis = SavedJob & { analysis: JobAnalysis | null };

type Row = {
  id: string;
  source: JobSourceId;
  external_id: string;
  title: string;
  company: string | null;
  location: string | null;
  modality: Modality | null;
  salary: string | null;
  description: string;
  url: string | null;
  published_at: string | null;
  created_at: string;
  job_applications: ApplicationRow | ApplicationRow[] | null;
  job_analyses: AnalysisRow | AnalysisRow[] | null;
};

type ApplicationRow = { status: ApplicationStatus; applied_at: string | null; notes: string | null };
type AnalysisRow = { score: number; version: number; cv_fingerprint: string; result?: JobAnalysis };

const one = <T,>(value: T | T[] | null): T | null => (Array.isArray(value) ? (value[0] ?? null) : value);

const POSTING_COLUMNS =
  "id,source,external_id,title,company,location,modality,salary,description,url,published_at,created_at";
const APPLICATION_COLUMNS = "status,applied_at,notes";

function mapRow(row: Row): SavedJobWithAnalysis {
  const app = one(row.job_applications);
  const analysis = one(row.job_analyses);
  return {
    id: row.id,
    source: row.source,
    externalId: row.external_id,
    title: row.title,
    company: row.company,
    location: row.location,
    modality: row.modality,
    salary: row.salary,
    description: row.description,
    url: row.url,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    status: app?.status ?? "guardada",
    appliedAt: app?.applied_at ?? null,
    notes: app?.notes ?? null,
    score: analysis?.score ?? null,
    analysisVersion: analysis?.version ?? null,
    cvFingerprint: analysis?.cv_fingerprint ?? null,
    analysis: analysis?.result ?? null,
  };
}

/** Vacantes guardadas (sin el análisis completo). */
export async function getSavedJobsAdmin(status?: ApplicationStatus): Promise<SavedJob[]> {
  const supabase = createAdminClient();
  // Con filtro de estado se usa !inner para descartar vacantes de otros estados.
  const applications = status ? "job_applications!inner" : "job_applications";
  const columns = `${POSTING_COLUMNS},${applications}(${APPLICATION_COLUMNS}),job_analyses(score,version,cv_fingerprint)`;
  let query = supabase.from("job_postings").select(columns).order("created_at", { ascending: false });
  if (status) query = query.eq("job_applications.status", status);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

export async function getSavedJobAdmin(id: string): Promise<SavedJobWithAnalysis | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      `${POSTING_COLUMNS},job_applications(${APPLICATION_COLUMNS}),job_analyses(score,version,cv_fingerprint,result)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as Row) : null;
}

/** Claves `fuente:id` de las vacantes ya guardadas (para marcarlas en la búsqueda). */
export async function getSavedJobKeysAdmin(): Promise<Map<string, string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("job_postings").select("id,source,external_id");
  if (error) throw error;
  return new Map(
    ((data ?? []) as { id: string; source: string; external_id: string }[]).map((r) => [
      `${r.source}:${r.external_id}`,
      r.id,
    ]),
  );
}

export type AgentOutputRow = {
  id: string;
  kind: "hv" | "evaluacion";
  content: unknown;
  cvFingerprint: string;
  createdAt: string;
};

/** Último resultado del agente de cada tipo para una vacante. */
export async function getLatestAgentOutputsAdmin(
  jobId: string,
): Promise<{ hv: AgentOutputRow | null; evaluacion: AgentOutputRow | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_agent_outputs")
    .select("id,kind,content,cv_fingerprint,created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  const rows = ((data ?? []) as { id: string; kind: "hv" | "evaluacion"; content: unknown; cv_fingerprint: string; created_at: string }[]).map(
    (r) => ({ id: r.id, kind: r.kind, content: r.content, cvFingerprint: r.cv_fingerprint, createdAt: r.created_at }),
  );
  return {
    hv: rows.find((r) => r.kind === "hv") ?? null,
    evaluacion: rows.find((r) => r.kind === "evaluacion") ?? null,
  };
}
