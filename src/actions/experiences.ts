"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  experienceSchema,
  type ExperienceInput,
} from "@/lib/validation/experience";

export type ExperienceActionState = {
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

function achievementsFromForm(formData: FormData) {
  return formValue(formData, "achievements")
    .split("\n")
    .map((achievement) => achievement.trim())
    .filter(Boolean);
}

function experienceFromFormData(formData: FormData) {
  return experienceSchema.safeParse({
    company: formValue(formData, "company"),
    position: formValue(formData, "position"),
    start_date: formValue(formData, "start_date"),
    end_date: formValue(formData, "end_date"),
    description: formValue(formData, "description"),
    achievements: achievementsFromForm(formData),
  });
}

function experiencePayload(input: ExperienceInput) {
  return {
    company: input.company,
    position: input.position,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    description: input.description ?? null,
    achievements: input.achievements,
  };
}

function revalidateExperiencePaths() {
  revalidatePath("/");
  revalidatePath("/experiencia");
  revalidatePath("/dashboard/experiencia");
}

export async function createExperience(
  _prevState: ExperienceActionState,
  formData: FormData,
): Promise<ExperienceActionState> {
  try {
    await ensureAuthenticated();
    const parsed = experienceFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la experiencia.",
      };
    }

    const { error } = await createAdminClient()
      .from("experiences")
      .insert(experiencePayload(parsed.data));
    if (error) throw error;

    revalidateExperiencePaths();
    return { status: "success", message: "Experiencia creada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear la experiencia.",
    };
  }
}

export async function updateExperience(
  id: string,
  _prevState: ExperienceActionState,
  formData: FormData,
): Promise<ExperienceActionState> {
  try {
    await ensureAuthenticated();
    const parsed = experienceFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la experiencia.",
      };
    }

    const { error } = await createAdminClient()
      .from("experiences")
      .update(experiencePayload(parsed.data))
      .eq("id", id);
    if (error) throw error;

    revalidateExperiencePaths();
    return { status: "success", message: "Experiencia actualizada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la experiencia.",
    };
  }
}

export async function deleteExperience(
  id: string,
): Promise<ExperienceActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("experiences")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidateExperiencePaths();
    return { status: "success", message: "Experiencia eliminada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la experiencia.",
    };
  }
}
