import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { clearGithubToken } from "@/lib/integrations/github-token";

export async function POST(request: Request) {
  try {
    await requireDashboardUser();
    await clearGithubToken();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("integration_connections")
      .update({ status: "disconnected", updated_at: new Date().toISOString() })
      .eq("provider", "github");
    if (error) throw error;
    return NextResponse.redirect(
      new URL("/dashboard/integraciones", request.url),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo desconectar GitHub.";
    return NextResponse.redirect(
      new URL(
        `/dashboard/integraciones?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
