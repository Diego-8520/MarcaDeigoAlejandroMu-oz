"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  profileLinkSchema,
  type ProfileLinkInput,
} from "@/lib/validation/profile";
import type { ProfileActionState } from "@/actions/profile";

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

function linkFromFormData(formData: FormData) {
  return profileLinkSchema.safeParse({
    label: formValue(formData, "label"),
    url: formValue(formData, "url"),
    icon: formValue(formData, "icon"),
    sort_order: formValue(formData, "sort_order") || "0",
  });
}

function linkPayload(input: ProfileLinkInput) {
  return {
    label: input.label,
    url: input.url,
    icon: input.icon ?? null,
    sort_order: input.sort_order,
  };
}

function revalidateProfilePaths() {
  revalidatePath("/");
  revalidatePath("/sobre-mi");
  revalidatePath("/dashboard/perfil");
}

function isMissingTableError(
  error: { code?: string; message?: string } | null,
) {
  if (!error) return false;

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table|does not exist/i.test(error.message ?? "")
  );
}

export async function createProfileLink(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  return saveProfileLink(formData);
}

export async function updateProfileLink(
  id: string,
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();
    const parsed = linkFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa el enlace.",
      };
    }

    const { error } = await createAdminClient()
      .from("profile_links")
      .update(linkPayload(parsed.data))
      .eq("id", id);
    if (error) {
      if (isMissingTableError(error)) {
        return {
          status: "error",
          message:
            "La tabla de enlaces sociales no está creada en Supabase. Aplica la migración profile_links.",
        };
      }
      throw error;
    }

    revalidateProfilePaths();
    return { status: "success", message: "Enlace actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el enlace.",
    };
  }
}

async function saveProfileLink(
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();
    const parsed = linkFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa el enlace.",
      };
    }

    const { error } = await createAdminClient()
      .from("profile_links")
      .insert(linkPayload(parsed.data));
    if (error) {
      if (isMissingTableError(error)) {
        return {
          status: "error",
          message:
            "La tabla de enlaces sociales no está creada en Supabase. Aplica la migración profile_links.",
        };
      }
      throw error;
    }

    revalidateProfilePaths();
    return { status: "success", message: "Enlace añadido." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo añadir el enlace.",
    };
  }
}

export async function deleteProfileLink(
  id: string,
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("profile_links")
      .delete()
      .eq("id", id);
    if (error) {
      if (isMissingTableError(error)) {
        return {
          status: "error",
          message:
            "La tabla de enlaces sociales no está creada en Supabase. Aplica la migración profile_links.",
        };
      }
      throw error;
    }

    revalidateProfilePaths();
    return { status: "success", message: "Enlace eliminado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el enlace.",
    };
  }
}

export async function reorderProfileLinks(
  orderedIds: string[],
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();
    const supabase = createAdminClient();
    const results = await Promise.all(
      orderedIds.map((id, sortOrder) =>
        supabase
          .from("profile_links")
          .update({ sort_order: sortOrder })
          .eq("id", id),
      ),
    );
    const error = results.find((result) => result.error)?.error;
    if (error) {
      if (isMissingTableError(error)) {
        return {
          status: "error",
          message:
            "La tabla de enlaces sociales no está creada en Supabase. Aplica la migración profile_links.",
        };
      }
      throw error;
    }

    revalidateProfilePaths();
    return { status: "success", message: "Orden actualizado." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo reordenar.",
    };
  }
}
