"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validation/testimonial";

export type TestimonialActionState = {
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

function testimonialFromFormData(formData: FormData) {
  return testimonialSchema.safeParse({
    author_name: formValue(formData, "author_name"),
    author_role: formValue(formData, "author_role"),
    author_company: formValue(formData, "author_company"),
    quote: formValue(formData, "quote"),
    project_id: formValue(formData, "project_id") || null,
    published: formData.get("published") === "on",
    sort_order: formValue(formData, "sort_order") || "0",
  });
}

function testimonialPayload(input: TestimonialInput) {
  return {
    author_name: input.author_name,
    author_role: input.author_role ?? null,
    author_company: input.author_company ?? null,
    quote: input.quote,
    project_id: input.project_id ?? null,
    published: input.published,
    sort_order: input.sort_order,
  };
}

function revalidateTestimonialPaths() {
  revalidatePath("/");
  revalidatePath("/proyectos/[slug]", "page");
  revalidatePath("/dashboard/testimonios");
}

export async function createTestimonial(
  _prevState: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  try {
    await ensureAuthenticated();
    const parsed = testimonialFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa el testimonio.",
      };
    }

    const { error } = await createAdminClient()
      .from("testimonials")
      .insert(testimonialPayload(parsed.data));
    if (error) throw error;

    revalidateTestimonialPaths();
    return { status: "success", message: "Testimonio creado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear el testimonio.",
    };
  }
}

export async function updateTestimonial(
  id: string,
  _prevState: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  try {
    await ensureAuthenticated();
    const parsed = testimonialFromFormData(formData);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Revisa el testimonio.",
      };
    }

    const { error } = await createAdminClient()
      .from("testimonials")
      .update(testimonialPayload(parsed.data))
      .eq("id", id);
    if (error) throw error;

    revalidateTestimonialPaths();
    return { status: "success", message: "Testimonio actualizado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el testimonio.",
    };
  }
}

export async function deleteTestimonial(
  id: string,
): Promise<TestimonialActionState> {
  try {
    await ensureAuthenticated();
    const { error } = await createAdminClient()
      .from("testimonials")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidateTestimonialPaths();
    return { status: "success", message: "Testimonio eliminado." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el testimonio.",
    };
  }
}

export async function reorderTestimonials(
  orderedIds: string[],
): Promise<TestimonialActionState> {
  try {
    await ensureAuthenticated();
    const supabase = createAdminClient();
    const results = await Promise.all(
      orderedIds.map((id, sortOrder) =>
        supabase
          .from("testimonials")
          .update({ sort_order: sortOrder })
          .eq("id", id),
      ),
    );
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;

    revalidateTestimonialPaths();
    return { status: "success", message: "Orden actualizado." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo reordenar.",
    };
  }
}
