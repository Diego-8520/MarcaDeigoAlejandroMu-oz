"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  educationSchema,
  type EducationInput,
} from "@/lib/validation/education";

export type EducationActionState = {
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

function parseEducation(formData: FormData) {
  return educationSchema.safeParse({
    institution: formValue(formData, "institution"),
    program: formValue(formData, "program"),
    start_date: formValue(formData, "start_date"),
    end_date: formValue(formData, "end_date"),
    status: formValue(formData, "status"),
    description: formValue(formData, "description"),
  });
}

function payload(input: EducationInput) {
  return {
    institution: input.institution,
    program: input.program,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    status: input.status ?? null,
    description: input.description ?? null,
  };
}

function revalidateEducationPaths() {
  revalidatePath("/");
  revalidatePath("/educacion");
  revalidatePath("/dashboard/educacion");
}

export async function createEducation(
  _prev: EducationActionState,
  formData: FormData,
): Promise<EducationActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseEducation(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la formación.",
      };
    const { error } = await createAdminClient()
      .from("education")
      .insert(payload(parsed.data));
    if (error) throw error;
    revalidateEducationPaths();
    return { status: "success", message: "Formación creada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear la formación.",
    };
  }
}

export async function updateEducation(
  id: string,
  _prev: EducationActionState,
  formData: FormData,
): Promise<EducationActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseEducation(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la formación.",
      };
    const { error } = await createAdminClient()
      .from("education")
      .update(payload(parsed.data))
      .eq("id", id);
    if (error) throw error;
    revalidateEducationPaths();
    return { status: "success", message: "Formación actualizada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la formación.",
    };
  }
}

export async function deleteEducation(
  id: string,
): Promise<EducationActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("education")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidateEducationPaths();
    return { status: "success", message: "Formación eliminada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la formación.",
    };
  }
}
