"use server";

import { revalidatePath } from "next/cache";
import { projectSchema, type ProjectInput } from "@/lib/validation/project";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { setProjectSkills } from "@/actions/skills";

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
  });
}

async function ensureAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No autorizado.");
  }
}

function payloadFromInput(input: ProjectInput) {
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

function revalidateProjectPaths() {
  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/[slug]", "page");
}

export async function createProject(
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

    revalidateProjectPaths();
    return { status: "success", message: "Proyecto creado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear el proyecto.",
    };
  }
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
    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    const skillsResult = await setProjectSkills(id, skillIdsFromForm(formData));
    if (skillsResult.status === "error") throw new Error(skillsResult.message);

    revalidateProjectPaths();
    return { status: "success", message: "Proyecto actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el proyecto.",
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
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el proyecto.",
    };
  }
}
