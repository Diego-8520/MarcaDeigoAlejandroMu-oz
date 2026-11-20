import { createAdminClient } from "@/lib/supabase/admin";
import type { ProjectImageKind } from "@/types/project";

/**
 * Guardado de imágenes de proyecto en Storage + fila en `project_images`.
 * Solo servidor (usa SUPABASE_SERVICE_ROLE_KEY). Lo usan las acciones del
 * panel (subida/importación) y la captura automática de sitios.
 */

export const PROJECT_IMAGES_BUCKET = "project-images";

export function storageObjectPath(storagePath: string) {
  return storagePath.startsWith(`${PROJECT_IMAGES_BUCKET}/`)
    ? storagePath.slice(PROJECT_IMAGES_BUCKET.length + 1)
    : storagePath;
}

export async function nextSortOrder(projectId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.sort_order != null ? data[0].sort_order + 1 : 0;
}

export type StoreImageInput = {
  projectId: string;
  bytes: ArrayBuffer | Uint8Array;
  contentType: string;
  extension: string;
  altText?: string;
  kind?: ProjectImageKind;
  source?: "manual" | "auto";
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  /** Sin valor: se añade al final de la galería. */
  sortOrder?: number;
};

export async function storeImage({
  projectId,
  bytes,
  contentType,
  extension,
  altText,
  kind = "upload",
  source = "manual",
  width = null,
  height = null,
  caption = null,
  sortOrder,
}: StoreImageInput) {
  const supabase = createAdminClient();
  const id = crypto.randomUUID();
  const objectPath = `${projectId}/${id}.${extension}`;
  const storagePath = `${PROJECT_IMAGES_BUCKET}/${objectPath}`;
  const order = sortOrder ?? (await nextSortOrder(projectId));

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(objectPath, bytes, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("project_images").insert({
    project_id: projectId,
    storage_path: storagePath,
    alt_text: altText?.trim() || null,
    sort_order: order,
    kind,
    source,
    width,
    height,
    caption: caption?.trim() || null,
  });

  if (insertError) {
    await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([objectPath]);
    throw insertError;
  }
}
