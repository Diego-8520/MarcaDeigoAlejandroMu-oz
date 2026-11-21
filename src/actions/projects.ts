"use server";

import { requireDashboardUser } from "@/lib/integrations/auth";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import { createAdminClient } from "@/lib/supabase/admin";
import { setProjectSkills } from "@/actions/skills";
import { revalidateProjectPaths } from "@/lib/projects/revalidate";
import {
  captureProjectScreenshots,
  markScreenshotsPending,
} from "@/lib/screenshots/run";

export type ProjectActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function listFromForm(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? undefined : value;
}

function jsonFormValue(formData: FormData, name: string) {
  const value = formValue(formData, name);
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function sameRepositoryUrl(
  first: string | undefined,
  second: string | undefined,
) {
  return (
    first?.replace(/\/$/, "").toLowerCase() ===
    second?.replace(/\/$/, "").toLowerCase()
  );
}

function skillIdsFromForm(formData: FormData) {
  return formData
    .getAll("skill_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function projectFromFormData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);

  return projectSchema.safeParse({
    title,
    slug,
    short_description: formValue(formData, "short_description"),
    description: formValue(formData, "description"),
    problem: formValue(formData, "problem"),
    solution: formValue(formData, "solution"),
    results: formValue(formData, "results"),
    technologies: listFromForm(formData, "technologies"),
    categories: listFromForm(formData, "categories"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    demo_url: String(formData.get("demo_url") ?? ""),
    repository_url: String(formData.get("repository_url") ?? ""),
    featured_image_url: String(formData.get("featured_image_url") ?? ""),
    github_metadata: jsonFormValue(formData, "github_metadata"),
    github_synced_at: formValue(formData, "github_synced_at"),
    vercel_project_url: String(formData.get("vercel_project_url") ?? ""),
    vercel_production_url: String(formData.get("vercel_production_url") ?? ""),
    vercel_custom_domain: formValue(formData, "vercel_custom_domain"),
    vercel_deployment_status: formValue(formData, "vercel_deployment_status"),
  });
}

async function ensureAuthenticated() {
  await requireDashboardUser();
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

function payloadFromInput(input: ProjectInput) {
  const githubMetadata =
    input.github_metadata &&
    sameRepositoryUrl(input.github_metadata.repositoryUrl, input.repository_url)
      ? input.github_metadata
      : null;

  return {
    title: input.title,
    slug: input.slug || slugify(input.title),
    short_description: input.short_description ?? null,
    description: input.description ?? null,
    problem: input.problem ?? null,
    solution: input.solution ?? null,
    results: input.results ?? null,
    technologies: input.technologies,
    categories: input.categories,
    status: input.status,
    featured: input.featured,
    published: input.published,
    demo_url: input.demo_url ?? null,
    repository_url: input.repository_url ?? null,
    featured_image_url: input.featured_image_url ?? null,
    github_metadata: githubMetadata ?? {},
    github_synced_at: githubMetadata
      ? (input.github_synced_at ?? new Date().toISOString())
      : null,
    vercel_project_url: input.vercel_project_url ?? null,
    vercel_production_url: input.vercel_production_url ?? null,
    vercel_custom_domain: input.vercel_custom_domain ?? null,
    vercel_deployment_status: input.vercel_deployment_status ?? null,
    updated_at: new Date().toISOString(),
  };
}

async function assertUniqueSlug(slug: string, currentId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("projects").select("id").eq("slug", slug);

  if (currentId) {
    query = query.neq("id", currentId);
  }

  const { data, error } = await query.limit(1);
  if (error) throw error;
  if (data && data.length > 0) {
    throw new Error("Ya existe un proyecto con ese slug.");
  }
}

/** URL que se captura: la demo o, si no hay, la de producción en Vercel. */
function captureUrl(row: { demo_url?: string | null; vercel_production_url?: string | null }) {
  return row.demo_url || row.vercel_production_url || null;
}

/**
 * Marca el proyecto como «capturando» y agenda la captura tras responder.
 * Corre dentro del maxDuration de la ruta del panel (60 s).
 */
async function scheduleScreenshots(projectId: string, url: string) {
  await markScreenshotsPending(projectId);
  after(() => captureProjectScreenshots(projectId, url));
}

export async function createProject(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  let createdId: string;
  try {
    await ensureAuthenticated();

    const parsed = projectFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message:
          parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
      };
    }

    const payload = payloadFromInput(parsed.data);
    await assertUniqueSlug(payload.slug);

    const supabase = createAdminClient();
    const { data: project, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    const skillsResult = await setProjectSkills(
      project.id,
      skillIdsFromForm(formData),
    );
    if (skillsResult.status === "error") throw new Error(skillsResult.message);

    const url = captureUrl(payload);
    if (url) await scheduleScreenshots(project.id, url);

    revalidateProjectPaths();
    createdId = project.id;
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error, "No se pudo crear el proyecto."),
    };
  }
  // A la edición: ahí está la galería y el estado de la captura.
  redirect(`/dashboard/proyectos/${createdId}/editar`);
}

export async function updateProject(
  id: string,
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  try {
    await ensureAuthenticated();

    const parsed = projectFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message:
          parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
      };
    }

    const payload = payloadFromInput(parsed.data);
    await assertUniqueSlug(payload.slug, id);

    const supabase = createAdminClient();
    const { data: previous, error: previousError } = await supabase
      .from("projects")
      .select("demo_url,vercel_production_url")
      .eq("id", id)
      .single();
    if (previousError) throw previousError;

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    const skillsResult = await setProjectSkills(id, skillIdsFromForm(formData));
    if (skillsResult.status === "error") throw new Error(skillsResult.message);

    // Nueva URL de demo: se vuelve a capturar el sitio.
    const url = captureUrl(payload);
    const urlChanged = url !== null && url !== captureUrl(previous);
    if (urlChanged) await scheduleScreenshots(id, url);

    revalidateProjectPaths();
    return {
      status: "success",
      message: urlChanged
        ? "Proyecto actualizado. Capturando el sitio nuevo…"
        : "Proyecto actualizado.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error, "No se pudo actualizar el proyecto."),
    };
  }
}

export async function deleteProject(id: string): Promise<ProjectActionState> {
  try {
    await ensureAuthenticated();

    const supabase = createAdminClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    revalidateProjectPaths();
    return { status: "success", message: "Proyecto eliminado." };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error, "No se pudo eliminar el proyecto."),
    };
  }
}

/** Botón «Capturar de nuevo» del panel. Reemplaza solo las imágenes automáticas. */
export async function recaptureProjectScreenshots(
  projectId: string,
): Promise<ProjectActionState> {
  try {
    await ensureAuthenticated();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select("demo_url,vercel_production_url")
      .eq("id", projectId)
      .single();
    if (error) throw error;

    const url = captureUrl(data);
    if (!url) {
      return { status: "error", message: "El proyecto no tiene URL de demo para capturar." };
    }

    await scheduleScreenshots(projectId, url);
    revalidateProjectPaths();
    return { status: "success", message: "Capturando el sitio…" };
  } catch (error) {
    return {
      status: "error",
      message: getErrorMessage(error, "No se pudo iniciar la captura."),
    };
  }
}
