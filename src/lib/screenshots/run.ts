import { createAdminClient } from "@/lib/supabase/admin";
import { PROJECT_IMAGES_BUCKET, storageObjectPath, storeImage } from "@/lib/projects/store-image";
import { revalidateProjectPaths } from "@/lib/projects/revalidate";
import { captureSite, type Shot } from "./capture";
import { UnsafeUrlError } from "./url-guard";

/**
 * Captura el sitio de un proyecto y reemplaza sus imágenes automáticas.
 * Las imágenes manuales (source = 'manual') nunca se tocan.
 * Pensado para ejecutarse dentro de `after()`: nunca lanza, deja el estado
 * en `projects.screenshots_status`.
 */

const KIND_ORDER: Record<Shot["kind"], number> = { desktop: 0, section: 1, mobile: 2 };

function altFor(title: string, shot: Shot) {
  if (shot.kind === "desktop") return `${title}: vista de escritorio`;
  if (shot.kind === "mobile") return `${title}: vista móvil`;
  return shot.caption ? `${title}: ${shot.caption}` : `${title}: sección del sitio`;
}

async function setStatus(
  projectId: string,
  status: "pending" | "ready" | "failed",
  error: string | null = null,
) {
  const supabase = createAdminClient();
  await supabase
    .from("projects")
    .update({
      screenshots_status: status,
      screenshots_error: error ? error.slice(0, 300) : null,
      ...(status === "ready" ? { screenshots_captured_at: new Date().toISOString() } : {}),
    })
    .eq("id", projectId);
}

/** Marca el proyecto como «capturando» antes de agendar el trabajo en segundo plano. */
export async function markScreenshotsPending(projectId: string) {
  await setStatus(projectId, "pending");
}

async function removeAutoImages(projectId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("id,storage_path")
    .eq("project_id", projectId)
    .eq("source", "auto");
  if (error) throw error;
  if (!data?.length) return;

  await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .remove(data.map((row) => storageObjectPath(row.storage_path)));
  const { error: deleteError } = await supabase
    .from("project_images")
    .delete()
    .in("id", data.map((row) => row.id));
  if (deleteError) throw deleteError;
}

/** Mueve las imágenes manuales detrás de las automáticas, conservando su orden. */
async function shiftManualImages(projectId: string, offset: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", projectId)
    .eq("source", "manual")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  await Promise.all(
    (data ?? []).map((row, index) =>
      supabase.from("project_images").update({ sort_order: offset + index }).eq("id", row.id),
    ),
  );
}

export async function captureProjectScreenshots(projectId: string, url: string) {
  try {
    await setStatus(projectId, "pending");

    const supabase = createAdminClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single();
    if (error) throw error;

    const shots = (await captureSite(url)).sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

    await removeAutoImages(projectId);
    await shiftManualImages(projectId, shots.length);

    for (const [index, shot] of shots.entries()) {
      await storeImage({
        projectId,
        bytes: shot.bytes,
        contentType: "image/webp",
        extension: "webp",
        altText: altFor(project.title, shot),
        kind: shot.kind,
        source: "auto",
        width: shot.width,
        height: shot.height,
        caption: shot.caption,
        sortOrder: index,
      });
    }

    await setStatus(projectId, "ready");
  } catch (error) {
    const message =
      error instanceof UnsafeUrlError
        ? error.message
        : error instanceof Error
          ? `No se pudo capturar el sitio: ${error.message}`
          : "No se pudo capturar el sitio.";
    console.error("[screenshots]", projectId, error);
    await setStatus(projectId, "failed", message).catch(() => undefined);
  } finally {
    try {
      revalidateProjectPaths();
    } catch (error) {
      console.error("[screenshots] revalidate", error);
    }
  }
}
