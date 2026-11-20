"use server";

import { revalidateProjectPaths } from "@/lib/projects/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  PROJECT_IMAGES_BUCKET as BUCKET,
  storageObjectPath,
  storeImage,
} from "@/lib/projects/store-image";

export type ProjectImageActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
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

  if (error || !user) {
    throw new Error("No autorizado.");
  }
}

function revalidateProjectImagePaths() {
  revalidateProjectPaths();
}


function validateFile(file: File) {
  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new Error("Sube una imagen JPG, PNG o WEBP.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("La imagen no puede pesar más de 5MB.");
  }

  return extension;
}

export async function uploadProjectImage(
  projectId: string,
  _prevState: ProjectImageActionState,
  formData: FormData
): Promise<ProjectImageActionState> {
  try {
    await ensureAuthenticated();

    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);
    const altText = String(formData.get("alt_text") ?? "");

    if (files.length === 0) {
      return { status: "error", message: "Selecciona al menos una imagen." };
    }

    for (const file of files) {
      const extension = validateFile(file);
      await storeImage({
        projectId,
        bytes: await file.arrayBuffer(),
        contentType: file.type,
        extension,
        altText,
      });
    }

    revalidateProjectImagePaths();
    return { status: "success", message: "Imagen guardada." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }
}

export async function importImageFromUrl(
  projectId: string,
  imageUrl: string,
  altText?: string
): Promise<ProjectImageActionState> {
  try {
    await ensureAuthenticated();

    const url = new URL(imageUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("La URL de imagen no es válida.");
    }

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error("No pude descargar esa imagen.");
    }

    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    const extension = ALLOWED_TYPES.get(contentType);
    if (!extension) {
      throw new Error("La imagen remota debe ser JPG, PNG o WEBP.");
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_SIZE) {
      throw new Error("La imagen remota pesa más de 5MB.");
    }

    await storeImage({ projectId, bytes, contentType, extension, altText });

    revalidateProjectImagePaths();
    return { status: "success", message: "Imagen importada." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo importar la imagen.",
    };
  }
}

export async function deleteProjectImage(
  imageId: string
): Promise<ProjectImageActionState> {
  try {
    await ensureAuthenticated();

    const supabase = createAdminClient();
    const { data: image, error: findError } = await supabase
      .from("project_images")
      .select("storage_path")
      .eq("id", imageId)
      .single();

    if (findError) throw findError;

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([storageObjectPath(image.storage_path)]);
    if (storageError) throw storageError;

    const { error: deleteError } = await supabase
      .from("project_images")
      .delete()
      .eq("id", imageId);
    if (deleteError) throw deleteError;

    revalidateProjectImagePaths();
    return { status: "success", message: "Imagen eliminada." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo eliminar la imagen.",
    };
  }
}

export async function reorderProjectImages(
  projectId: string,
  orderedImageIds: string[]
): Promise<ProjectImageActionState> {
  try {
    await ensureAuthenticated();

    const supabase = createAdminClient();
    const updates = orderedImageIds.map((id, sortOrder) =>
      supabase
        .from("project_images")
        .update({ sort_order: sortOrder })
        .eq("project_id", projectId)
        .eq("id", id)
    );
    const results = await Promise.all(updates);
    const error = results.find((result) => result.error)?.error;

    if (error) throw error;

    revalidateProjectImagePaths();
    return { status: "success", message: "Orden actualizado." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo reordenar.",
    };
  }
}

export async function updateProjectImageAltText(
  imageId: string,
  altText: string
): Promise<ProjectImageActionState> {
  try {
    await ensureAuthenticated();

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("project_images")
      .update({ alt_text: altText.trim() || null })
      .eq("id", imageId);

    if (error) throw error;

    revalidateProjectImagePaths();
    return { status: "success", message: "Texto alternativo guardado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo guardar el texto alternativo.",
    };
  }
}
