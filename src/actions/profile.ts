"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getProfileAdmin } from "@/lib/data/profile-queries";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const AVATAR_BUCKET = "profile-media";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

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

function profileFromFormData(formData: FormData) {
  return profileSchema.safeParse({
    full_name: formValue(formData, "full_name"),
    headline: formValue(formData, "headline"),
    bio: formValue(formData, "bio"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    location: formValue(formData, "location"),
    website: formValue(formData, "website"),
  });
}

function profilePayload(input: ProfileInput) {
  return {
    full_name: input.full_name,
    headline: input.headline ?? null,
    bio: input.bio ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    location: input.location ?? null,
    website: input.website ?? null,
    updated_at: new Date().toISOString(),
  };
}

function revalidateProfilePaths() {
  revalidatePath("/");
  revalidatePath("/sobre-mi");
  revalidatePath("/dashboard/perfil");
}

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();

    const parsed = profileFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message:
          parsed.error.issues[0]?.message ?? "Revisa los datos del perfil.",
      };
    }

    const supabase = createAdminClient();
    const profile = await getProfileAdmin();
    const payload = profilePayload(parsed.data);
    const result = profile
      ? await supabase.from("profiles").update(payload).eq("id", profile.id)
      : await supabase.from("profiles").insert(payload);

    if (result.error) throw result.error;

    revalidateProfilePaths();
    return { status: "success", message: "Perfil actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.",
    };
  }
}

function validateAvatar(file: File) {
  const extension = ALLOWED_AVATAR_TYPES.get(file.type);
  if (!extension) throw new Error("Sube un avatar JPG, PNG o WEBP.");
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("El avatar no puede pesar más de 5MB.");
  }
  return extension;
}

export async function uploadAvatar(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    await ensureAuthenticated();

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "Selecciona una imagen." };
    }

    const extension = validateAvatar(file);
    const supabase = createAdminClient();
    const objectPath = `profile/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(objectPath);
    const profile = await getProfileAdmin();
    const result = profile
      ? await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id)
      : await supabase.from("profiles").insert({
          full_name: "Diego Alejandro Muñoz",
          avatar_url: publicUrl.publicUrl,
        });

    if (result.error) {
      await supabase.storage.from(AVATAR_BUCKET).remove([objectPath]);
      throw result.error;
    }

    revalidateProfilePaths();
    return { status: "success", message: "Avatar actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo subir el avatar.",
    };
  }
}
