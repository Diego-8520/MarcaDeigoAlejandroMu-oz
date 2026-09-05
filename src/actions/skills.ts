"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { skillSchema, type SkillInput } from "@/lib/validation/skill";
import { linkSkillsToProject } from "@/lib/data/skills-queries";

export type SkillActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function ensureAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("No autorizado.");
}

function formValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function parseSkill(formData: FormData) {
  return skillSchema.safeParse({
    name: formValue(formData, "name"),
    category: formValue(formData, "category"),
    description: formValue(formData, "description"),
  });
}

function payload(input: SkillInput) {
  return {
    name: input.name,
    category: input.category ?? null,
    description: input.description ?? null,
  };
}

function revalidateSkillPaths() {
  revalidatePath("/");
  revalidatePath("/sobre-mi");
  revalidatePath("/proyectos/[slug]", "page");
  revalidatePath("/dashboard/skills");
}

export async function createSkill(
  _prev: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseSkill(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la skill.",
      };
    const { error } = await createAdminClient()
      .from("skills")
      .insert(payload(parsed.data));
    if (error) throw error;
    revalidateSkillPaths();
    return { status: "success", message: "Skill creada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo crear la skill.",
    };
  }
}

export async function updateSkill(
  id: string,
  _prev: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseSkill(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la skill.",
      };
    const { error } = await createAdminClient()
      .from("skills")
      .update(payload(parsed.data))
      .eq("id", id);
    if (error) throw error;
    revalidateSkillPaths();
    return { status: "success", message: "Skill actualizada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la skill.",
    };
  }
}

export async function deleteSkill(id: string): Promise<SkillActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("skills")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidateSkillPaths();
    return { status: "success", message: "Skill eliminada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la skill.",
    };
  }
}

export async function setProjectSkills(
  projectId: string,
  skillIds: string[],
): Promise<SkillActionState> {
  try {
    await ensureAuthenticated();
    await linkSkillsToProject(projectId, skillIds);
    revalidateSkillPaths();
    return { status: "success", message: "Skills del proyecto actualizadas." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar las skills del proyecto.",
    };
  }
}
