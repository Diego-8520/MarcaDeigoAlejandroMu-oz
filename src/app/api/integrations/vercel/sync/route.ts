import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { getVercelResources } from "@/lib/integrations/vercel";

export async function POST(request: Request) {
  let runId: string | null = null;
  try {
    await requireDashboardUser();
    const supabase = createAdminClient();
    const run = await supabase
      .from("sync_runs")
      .insert({ provider: "vercel" })
      .select("id")
      .single();
    if (run.error) throw run.error;
    runId = run.data.id;
    const resources = await getVercelResources();
    const now = new Date().toISOString();
    const projectRows = resources.map(({ project, deployment }) => ({
      provider: "vercel",
      resource_type: "project",
      external_id: project.id,
      owner_label: process.env.VERCEL_TEAM_ID ?? "personal",
      name: project.name,
      description: project.framework,
      visibility: null,
      availability: "available",
      payload: { project, deployment },
      last_synced_at: now,
      sync_error: null,
      updated_at: now,
    }));
    const deploymentRows = resources
      .filter(({ deployment }) => deployment)
      .map(({ project, deployment }) => ({
        provider: "vercel",
        resource_type: "deployment",
        external_id: deployment!.uid,
        owner_label: process.env.VERCEL_TEAM_ID ?? "personal",
        name: project.name,
        description: deployment!.url,
        visibility: null,
        availability: "available",
        payload: deployment!,
        last_synced_at: now,
        sync_error: null,
        updated_at: now,
      }));
    const rows = [...projectRows, ...deploymentRows];
    if (rows.length) {
      const { error } = await supabase
        .from("external_resources")
        .upsert(rows, { onConflict: "provider,resource_type,external_id" });
      if (error) throw error;
    }
    const githubResources = await supabase
      .from("external_resources")
      .select("id,payload")
      .eq("provider", "github")
      .eq("resource_type", "repository");
    if (githubResources.error) throw githubResources.error;
    const vercelProjects = await supabase
      .from("external_resources")
      .select("id,external_id,payload")
      .eq("provider", "vercel")
      .eq("resource_type", "project");
    if (vercelProjects.error) throw vercelProjects.error;
    const githubByName = new Map(
      (githubResources.data ?? []).map((resource) => {
        const payload = resource.payload as { fullName?: string };
        return [payload.fullName?.toLowerCase(), resource.id] as const;
      }),
    );
    const links = (vercelProjects.data ?? []).flatMap((resource) => {
      const payload = resource.payload as {
        project?: { link?: { org?: string; repo?: string } };
      };
      const link = payload.project?.link;
      const githubId =
        link?.org && link.repo
          ? githubByName.get(`${link.org}/${link.repo}`.toLowerCase())
          : undefined;
      return githubId
        ? [
            {
              source_resource_id: resource.id,
              target_resource_id: githubId,
              relation: "linked-repository",
              match_method: "exact-link",
              match_confidence: "high",
              confirmed: true,
            },
          ]
        : [];
    });
    if (links.length) {
      const { error } = await supabase
        .from("external_resource_links")
        .upsert(links, {
          onConflict: "source_resource_id,target_resource_id,relation",
        });
      if (error) throw error;
    }
    const { error: connectionError } = await supabase
      .from("integration_connections")
      .upsert(
        {
          provider: "vercel",
          account_label: process.env.VERCEL_TEAM_ID
            ? `team ${process.env.VERCEL_TEAM_ID}`
            : "cuenta personal",
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
        resources_found: resources.length,
        completed_at: now,
      })
      .eq("id", runId);
    if (runError) throw runError;
    return NextResponse.redirect(
      new URL(
        `/dashboard/recursos-externos?provider=vercel&synced=${resources.length}`,
        request.url,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo sincronizar Vercel.";
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
