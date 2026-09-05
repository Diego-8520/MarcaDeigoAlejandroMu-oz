"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  certificationSchema,
  type CertificationInput,
} from "@/lib/validation/certification";

export type CertificationActionState = {
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

function parseCertification(formData: FormData) {
  return certificationSchema.safeParse({
    name: formValue(formData, "name"),
    issuer: formValue(formData, "issuer"),
    issue_date: formValue(formData, "issue_date"),
    credential_url: formValue(formData, "credential_url"),
  });
}

function payload(input: CertificationInput) {
  return {
    name: input.name,
    issuer: input.issuer ?? null,
    issue_date: input.issue_date ?? null,
    credential_url: input.credential_url ?? null,
  };
}

function revalidateCertificationPaths() {
  revalidatePath("/");
  revalidatePath("/educacion");
  revalidatePath("/dashboard/educacion");
}

export async function createCertification(
  _prev: CertificationActionState,
  formData: FormData,
): Promise<CertificationActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseCertification(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la certificación.",
      };
    const { error } = await createAdminClient()
      .from("certifications")
      .insert(payload(parsed.data));
    if (error) throw error;
    revalidateCertificationPaths();
    return { status: "success", message: "Certificación creada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear la certificación.",
    };
  }
}

export async function updateCertification(
  id: string,
  _prev: CertificationActionState,
  formData: FormData,
): Promise<CertificationActionState> {
  try {
    await ensureAuthenticated();
    const parsed = parseCertification(formData);
    if (!parsed.success)
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa la certificación.",
      };
    const { error } = await createAdminClient()
      .from("certifications")
      .update(payload(parsed.data))
      .eq("id", id);
    if (error) throw error;
    revalidateCertificationPaths();
    return { status: "success", message: "Certificación actualizada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la certificación.",
    };
  }
}

export async function deleteCertification(
  id: string,
): Promise<CertificationActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("certifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidateCertificationPaths();
    return { status: "success", message: "Certificación eliminada." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la certificación.",
    };
  }
}
