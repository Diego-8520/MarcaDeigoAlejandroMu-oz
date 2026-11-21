import { createAdminClient } from "@/lib/supabase/admin";
import type { SavedJobWithAnalysis } from "@/lib/data/jobs-queries";
import { ANALYSIS_VERSION, analyzeJob } from "./analysis";
import { cvFingerprint } from "./master-cv";
import type { JobAnalysis, MasterCv, NormalizedJob } from "./types";

/** Calcula y guarda el análisis de una vacante. */
export async function storeAnalysis(jobId: string, job: NormalizedJob, cv: MasterCv): Promise<JobAnalysis> {
  const analysis = analyzeJob(job, cv);
  const supabase = createAdminClient();
  const { error } = await supabase.from("job_analyses").upsert(
    {
      job_id: jobId,
      version: analysis.version,
      score: analysis.score,
      cv_fingerprint: cvFingerprint(cv),
      result: analysis,
      analyzed_at: new Date().toISOString(),
    },
    { onConflict: "job_id" },
  );
  if (error) throw error;
  return analysis;
}

/** Devuelve el análisis guardado o lo recalcula si cambió tu HV o las reglas. */
export async function ensureFreshAnalysis(job: SavedJobWithAnalysis, cv: MasterCv): Promise<JobAnalysis> {
  if (job.analysis && job.analysisVersion === ANALYSIS_VERSION && job.cvFingerprint === cvFingerprint(cv)) {
    return job.analysis;
  }
  return storeAnalysis(job.id, job, cv);
}

/** Guarda (o actualiza) una vacante, su análisis y su postulación en estado "guardada". */
export async function saveJob(job: NormalizedJob, cv: MasterCv): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_postings")
    .upsert(
      {
        source: job.source,
        external_id: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        modality: job.modality,
        salary: job.salary,
        description: job.description,
        url: job.url,
        published_at: job.publishedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "source,external_id" },
    )
    .select("id")
    .single();
  if (error) throw error;
  const id = (data as { id: string }).id;

  const { error: appError } = await supabase
    .from("job_applications")
    .upsert({ job_id: id, status: "guardada" }, { onConflict: "job_id", ignoreDuplicates: true });
  if (appError) throw appError;

  await storeAnalysis(id, job, cv);
  return id;
}

/** Guarda un resultado ya validado del agente. */
export async function storeAgentOutput(
  jobId: string,
  kind: "hv" | "evaluacion",
  content: unknown,
  cv: MasterCv,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_agent_outputs")
    .insert({ job_id: jobId, kind, content, cv_fingerprint: cvFingerprint(cv) })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}
