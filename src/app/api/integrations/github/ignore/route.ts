import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";

export async function POST(request: Request) {
  try {
    await requireDashboardUser();
    const resourceId = (await request.formData()).get("resource_id");
    if (typeof resourceId !== "string" || !resourceId)
      throw new Error("Recurso inválido.");
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("external_resources")
      .update({ availability: "ignored", updated_at: new Date().toISOString() })
      .eq("id", resourceId)
      .eq("provider", "github");
    if (error) throw error;
    return NextResponse.redirect(
      new URL("/dashboard/recursos-externos", request.url),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo ignorar el repositorio.";
    return NextResponse.redirect(
      new URL(
        `/dashboard/recursos-externos?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
