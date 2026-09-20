"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CV_BUCKET, getCvStorageObjectPath } from "@/lib/data/cv-queries";
import { MAX_CV_FILE_SIZE, cvUploadSchema } from "@/lib/validation/cv";

export type CvActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

function revalidateCvPaths() {
  revalidatePath("/cv");
  revalidatePath("/dashboard/cv");
}

async function ensureCvBucket(admin: ReturnType<typeof createAdminClient>) {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === CV_BUCKET)) {
      await admin.storage.createBucket(CV_BUCKET, { public: true });
    }
  } catch (err) {
    console.error("Aviso al verificar bucket cv:", err);
  }
}

export async function uploadCvAction(
  _prevState: CvActionState,
  formData: FormData
): Promise<CvActionState> {
  try {
    await ensureAuthenticated();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "Selecciona un archivo PDF." };
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return { status: "error", message: "El archivo debe ser un documento PDF (.pdf)." };
    }

    if (file.size > MAX_CV_FILE_SIZE) {
      return { status: "error", message: "El archivo no puede superar los 10MB." };
    }

    const rawLabel = String(formData.get("label") ?? "").trim();
    const isVisible =
      formData.get("isVisible") === "true" ||
      formData.get("isVisible") === "on";

    const parsed = cvUploadSchema.safeParse({
      label: rawLabel || undefined,
      isVisible,
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa los campos ingresados.",
      };
    }

    const finalLabel =
      parsed.data.label ||
      file.name.replace(/\.[^/.]+$/, "").trim() ||
      "CV Diego Alejandro Muñoz";

    const admin = createAdminClient();
    await ensureCvBucket(admin);

    // Obtener el siguiente sort_order para agregar al final
    const { data: latestSort } = await admin
      .from("cv_documents")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder = (latestSort?.[0]?.sort_order ?? -1) + 1;

    // Generar ruta única para Storage
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();
    const objectPath = `${Date.now()}-${cleanFileName || "documento"}.pdf`;

    const { error: uploadError } = await admin.storage
      .from(CV_BUCKET)
      .upload(objectPath, await file.arrayBuffer(), {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error al subir el PDF a Storage: ${uploadError.message}`);
    }

    const { error: insertError } = await admin.from("cv_documents").insert({
      label: finalLabel,
      storage_path: objectPath,
      is_visible: parsed.data.isVisible,
      sort_order: nextSortOrder,
    });

    if (insertError) {
      // Limpiar archivo huérfano si la BD falla
      await admin.storage.from(CV_BUCKET).remove([objectPath]);
      throw insertError;
    }

    revalidateCvPaths();
    return {
      status: "success",
      message: `CV "${finalLabel}" subido exitosamente.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo completar la subida del CV.",
    };
  }
}

export async function toggleCvVisibilityAction(
  id: string,
  currentVisible: boolean
): Promise<CvActionState> {
  try {
    await ensureAuthenticated();

    const admin = createAdminClient();
    const nextVisible = !currentVisible;

    const { error } = await admin
      .from("cv_documents")
      .update({ is_visible: nextVisible })
      .eq("id", id);

    if (error) throw error;

    revalidateCvPaths();
    return {
      status: "success",
      message: nextVisible ? "El CV ahora es visible en /cv." : "El CV ahora está oculto.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la visibilidad.",
    };
  }
}

export async function deleteCvAction(id: string): Promise<CvActionState> {
  try {
    await ensureAuthenticated();

    const admin = createAdminClient();

    // 1. Obtener la ruta del archivo antes de borrar
    const { data: doc, error: findError } = await admin
      .from("cv_documents")
      .select("storage_path, label")
      .eq("id", id)
      .single();

    if (findError || !doc) {
      throw new Error("El documento no existe o ya fue eliminado.");
    }

    // 2. Eliminar de Storage
    const objectPath = getCvStorageObjectPath(doc.storage_path);
    const { error: storageError } = await admin.storage
      .from(CV_BUCKET)
      .remove([objectPath]);

    if (storageError) {
      console.error("Error al borrar el archivo en Storage:", storageError);
    }

    // 3. Eliminar de la base de datos
    const { error: deleteError } = await admin
      .from("cv_documents")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    revalidateCvPaths();
    return {
      status: "success",
      message: `CV "${doc.label}" eliminado por completo.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo eliminar el CV.",
    };
  }
}

export async function reorderCvAction(
  orderedIds: string[]
): Promise<CvActionState> {
  try {
    await ensureAuthenticated();

    const admin = createAdminClient();
    const updates = orderedIds.map((id, index) =>
      admin
        .from("cv_documents")
        .update({ sort_order: index })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const hasError = results.find((r) => r.error)?.error;
    if (hasError) throw hasError;

    revalidateCvPaths();
    return { status: "success", message: "Orden de los CVs actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo actualizar el orden.",
    };
  }
}

export async function setPrimaryCvAction(id: string): Promise<CvActionState> {
  try {
    await ensureAuthenticated();

    const admin = createAdminClient();
    const { data: docs, error: fetchError } = await admin
      .from("cv_documents")
      .select("id")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError || !docs) throw fetchError || new Error("No hay documentos.");

    const remainingIds = docs.map((d) => d.id).filter((docId) => docId !== id);
    const newOrder = [id, ...remainingIds];

    return await reorderCvAction(newOrder);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo establecer como principal.",
    };
  }
}
