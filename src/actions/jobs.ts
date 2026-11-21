"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSavedJobAdmin, isApplicationStatus } from "@/lib/data/jobs-queries";
import { getMasterCv } from "@/lib/jobs/master-cv";
import { ManualJobError, buildManualJob } from "@/lib/jobs/sources/manual";
import { saveJob, storeAnalysis } from "@/lib/jobs/store";
import { UnsafeUrlError } from "@/lib/screenshots/url-guard";

export type JobActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  id?: string;
};

const jobSchema = z.object({
  source: z.enum(["getonboard", "remotive", "adzuna", "jooble", "manual"]),
  externalId: z.string().min(1).max(500),
  title: z.string().min(1).max(300),
  company: z.string().max(300).nullable(),
  location: z.string().max(300).nullable(),
  modality: z.enum(["remoto", "hibrido", "presencial"]).nullable(),
  salary: z.string().max(200).nullable(),
  description: z.string().max(100_000),
  url: z.string().url().max(2000).nullable(),
  publishedAt: z.string().max(40).nullable(),
});

function revalidateJobs(id?: string) {
  revalidatePath("/dashboard/empleo", "layout");
  if (id) revalidatePath(`/dashboard/empleo/${id}`);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** Guarda una vacante de la búsqueda y calcula su análisis. */
export async function saveJobAction(input: unknown): Promise<JobActionState> {
  try {
    await requireDashboardUser();
    const parsed = jobSchema.safeParse(input);
    if (!parsed.success) return { status: "error", message: "La vacante no tiene un formato válido." };
    const id = await saveJob(parsed.data, await getMasterCv());
    revalidateJobs(id);
    return { status: "success", message: "Vacante guardada.", id };
  } catch (error) {
    return { status: "error", message: errorMessage(error, "No se pudo guardar la vacante.") };
  }
}

/** Crea una vacante a partir de texto pegado o una URL. */
export async function createManualJobAction(
  _prev: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  let id: string;
  try {
    await requireDashboardUser();
    const field = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : null;
    };
    const url = field("url")?.trim() || null;
    if (url && !z.string().url().safeParse(url).success) {
      return { status: "error", message: "La URL no es válida." };
    }
    const job = await buildManualJob({
      url,
      text: field("text"),
      title: field("title"),
      company: field("company"),
      location: field("location"),
    });
    id = await saveJob(job, await getMasterCv());
  } catch (error) {
    const known = error instanceof ManualJobError || error instanceof UnsafeUrlError;
    return {
      status: "error",
      message: known ? (error as Error).message : errorMessage(error, "No se pudo analizar la vacante."),
    };
  }
  revalidateJobs(id);
  redirect(`/dashboard/empleo/${id}`);
}

/** Cambia el estado de la postulación y/o las notas. */
export async function updateApplicationAction(
  jobId: string,
  status: string,
  notes?: string | null,
): Promise<JobActionState> {
  try {
    await requireDashboardUser();
    if (!isApplicationStatus(status)) return { status: "error", message: "Estado no válido." };
    const supabase = createAdminClient();
    const { data: current } = await supabase
      .from("job_applications")
      .select("applied_at")
      .eq("job_id", jobId)
      .maybeSingle();
    const appliedAt =
      (current as { applied_at: string | null } | null)?.applied_at ??
      (status !== "guardada" && status !== "descartada" ? new Date().toISOString() : null);
    const { error } = await supabase.from("job_applications").upsert(
      {
        job_id: jobId,
        status,
        applied_at: appliedAt,
        ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "job_id" },
    );
    if (error) throw error;
    revalidateJobs(jobId);
    return { status: "success", message: "Postulación actualizada." };
  } catch (error) {
    return { status: "error", message: errorMessage(error, "No se pudo actualizar.") };
  }
}

/** Recalcula el análisis con tu HV actual. */
export async function reanalyzeJobAction(jobId: string): Promise<JobActionState> {
  try {
    await requireDashboardUser();
    const job = await getSavedJobAdmin(jobId);
    if (!job) return { status: "error", message: "La vacante no existe." };
    await storeAnalysis(job.id, job, await getMasterCv());
    revalidateJobs(jobId);
    return { status: "success", message: "Análisis actualizado." };
  } catch (error) {
    return { status: "error", message: errorMessage(error, "No se pudo recalcular.") };
  }
}

/** Reemplaza la descripción (p. ej. pegar el texto completo de una vacante con fragmento). */
export async function updateJobDescriptionAction(jobId: string, description: string): Promise<JobActionState> {
  try {
    await requireDashboardUser();
    const text = description.trim();
    if (text.length < 80) return { status: "error", message: "Pega la descripción completa de la vacante." };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("job_postings")
      .update({ description: text.slice(0, 100_000), updated_at: new Date().toISOString() })
      .eq("id", jobId);
    if (error) throw error;
    const job = await getSavedJobAdmin(jobId);
    if (job) await storeAnalysis(job.id, job, await getMasterCv());
    revalidateJobs(jobId);
    return { status: "success", message: "Descripción actualizada y análisis recalculado." };
  } catch (error) {
    return { status: "error", message: errorMessage(error, "No se pudo actualizar la descripción.") };
  }
}

export async function deleteJobAction(jobId: string): Promise<JobActionState> {
  try {
    await requireDashboardUser();
    const supabase = createAdminClient();
    const { error } = await supabase.from("job_postings").delete().eq("id", jobId);
    if (error) throw error;
    revalidateJobs();
    return { status: "success", message: "Vacante eliminada." };
  } catch (error) {
    return { status: "error", message: errorMessage(error, "No se pudo eliminar.") };
  }
}
