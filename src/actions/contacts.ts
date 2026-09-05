"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_STATUSES } from "@/lib/data/contacts-queries";

export type ContactActionState = {
  status: "success" | "error";
  message: string;
};
type ContactStatus = (typeof CONTACT_STATUSES)[number];

async function ensureAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("No autorizado.");
}

function isContactStatus(status: string): status is ContactStatus {
  return CONTACT_STATUSES.includes(status as ContactStatus);
}

export async function updateContactStatus(
  id: string,
  status: string,
): Promise<ContactActionState> {
  try {
    await ensureAuthenticated();
    if (!isContactStatus(status))
      return { status: "error", message: "Estado no válido." };
    const { error } = await createAdminClient()
      .from("contacts")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/contactos");
    return { status: "success", message: "Estado actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado.",
    };
  }
}

export async function updateContactNotes(
  id: string,
  notes: string,
): Promise<ContactActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("contacts")
      .update({ notes: notes.trim() || null })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/contactos");
    return { status: "success", message: "Notas guardadas." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las notas.",
    };
  }
}
