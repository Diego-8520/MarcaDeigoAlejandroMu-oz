import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { getSupabaseProjects } from "@/lib/integrations/supabase-management";

export async function POST(request: Request) {
  let runId: string | null = null;
  try {
    await requireDashboardUser();
    const supabase = createAdminClient();
    const run = await supabase
      .from("sync_runs")
      .insert({ provider: "supabase" })
      .select("id")
      .single();
    if (run.error) throw run.error;
    runId = run.data.id;
    const projects = await getSupabaseProjects();
    const now = new Date().toISOString();
    const rows = projects.map((project) => ({
      provider: "supabase",
      resource_type: "project",
      external_id: project.ref,
      owner_label: null,
      name: project.name,
      description: project.region,
      visibility: null,
      availability: "available",
      payload: {
        ref: project.ref,
        name: project.name,
        region: project.region,
        status: project.status,
        url: project.url ?? `https://${project.ref}.supabase.co`,
      },
      last_synced_at: now,
      sync_error: null,
      updated_at: now,
    }));
    if (rows.length) {
      const { error } = await supabase
        .from("external_resources")
        .upsert(rows, { onConflict: "provider,resource_type,external_id" });
      if (error) throw error;
    }
    const { error: connectionError } = await supabase
      .from("integration_connections")
      .upsert(
        {
          provider: "supabase",
          account_label: `${projects.length} proyecto${projects.length === 1 ? "" : "s"}`,
          status: "connected",
          last_synced_at: now,
          sync_error: null,
          updated_at: now,
        },
        { onConflict: "provider" },
      );
    if (connectionError) throw connectionError;
    const { error: runError } = await supabase
      .from("sync_runs")
      .update({
        status: "completed",
        resources_found: projects.length,
        completed_at: now,
      })
      .eq("id", runId);
    if (runError) throw runError;
    return NextResponse.redirect(
      new URL(
        `/dashboard/recursos-externos?provider=supabase&synced=${projects.length}`,
        request.url,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo sincronizar Supabase.";
    if (runId)
      await createAdminClient()
        .from("sync_runs")
        .update({
          status: "failed",
          error: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);
    return NextResponse.redirect(
      new URL(
        `/dashboard/integraciones?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
