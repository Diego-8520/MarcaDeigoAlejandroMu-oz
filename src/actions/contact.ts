"use server";

import { contactSchema } from "@/lib/validation/contact";
import { createClient } from "@/lib/supabase/server";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitContact(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    requestType: formData.get("requestType"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contacts").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company ?? null,
      request_type: parsed.data.requestType,
      message: parsed.data.message,
      status: "nuevo",
    });

    if (error) throw error;

    // TODO Fase 3: disparar webhook de n8n para notificación por email.

    return { status: "success", message: "Mensaje enviado. Te responderé pronto." };
  } catch {
    return {
      status: "error",
      message: "No se pudo enviar el mensaje. Intenta de nuevo o escribe directamente por correo.",
    };
  }
}
