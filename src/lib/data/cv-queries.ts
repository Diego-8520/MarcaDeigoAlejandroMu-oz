import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const CV_BUCKET = "cv";

export type CvDocument = {
  id: string;
  label: string;
  storagePath: string;
  downloadUrl: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
};

type CvDocumentRow = {
  id: string;
  label: string;
  storage_path: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
};

const CV_COLUMNS = "id,label,storage_path,is_visible,sort_order,created_at";

export function getCvStorageObjectPath(storagePath: string): string {
  return storagePath.startsWith(`${CV_BUCKET}/`)
    ? storagePath.slice(CV_BUCKET.length + 1)
    : storagePath;
}

function resolveCvDownloadUrl(
  supabase: { storage: { from: (bucket: string) => { getPublicUrl: (path: string) => { data: { publicUrl: string } } } } },
  storagePath: string
): string {
  const objectPath = getCvStorageObjectPath(storagePath);
  const { data } = supabase.storage.from(CV_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

function mapCvDocument(
  row: CvDocumentRow,
  supabase: { storage: { from: (bucket: string) => { getPublicUrl: (path: string) => { data: { publicUrl: string } } } } }
): CvDocument {
  return {
    id: row.id,
    label: row.label,
    storagePath: row.storage_path,
    downloadUrl: resolveCvDownloadUrl(supabase, row.storage_path),
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table|does not exist/i.test(error.message ?? "")
  );
}

/**
 * Obtiene los CVs visibles para el sitio público (/cv).
 * Ordenados por sort_order ascendente y created_at descendente.
 * Utiliza el cliente anónimo/SSR respetando la RLS.
 */
export async function getVisibleCvDocuments(): Promise<CvDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cv_documents")
    .select(CV_COLUMNS)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return ((data ?? []) as CvDocumentRow[]).map((row) =>
    mapCvDocument(row, supabase)
  );
}

/**
 * Obtiene todos los CVs (visibles y ocultos) para el panel de administración (/dashboard/cv).
 * Utiliza el cliente service_role.
 */
export async function getAllCvDocumentsAdmin(): Promise<CvDocument[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cv_documents")
    .select(CV_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return ((data ?? []) as CvDocumentRow[]).map((row) =>
    mapCvDocument(row, supabase)
  );
}
