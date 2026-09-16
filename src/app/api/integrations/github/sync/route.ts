import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";
import {
  getGithubAccount,
  getGithubRepositories,
} from "@/lib/integrations/github";

export async function POST(request: Request) {
  let runId: string | null = null;
  try {
    await requireDashboardUser();
    const supabase = createAdminClient();
    const run = await supabase
      .from("sync_runs")
      .insert({ provider: "github", status: "running" })
      .select("id")
      .single();
    if (run.error) throw run.error;
    runId = run.data.id;

    const [account, repositories] = await Promise.all([
      getGithubAccount(),
      getGithubRepositories(),
    ]);

    const rows = repositories.map((repository) => ({
      provider: "github",
      resource_type: "repository",
      external_id: repository.externalId,
      owner_label: repository.owner,
      name: repository.name,
      description: repository.description,
      visibility: repository.visibility,
      payload: repository,
      availability: "available",
      last_synced_at: new Date().toISOString(),
      sync_error: null,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from("external_resources").upsert(rows, {
        onConflict: "provider,resource_type,external_id",
      });
      if (error) throw error;
    }

    const now = new Date().toISOString();
    const { error: connectionError } = await supabase
      .from("integration_connections")
      .upsert(
        {
          provider: "github",
          account_label: account?.login ? `@${account.login}` : null,
          status: "connected",
          metadata: {
            login: account?.login ?? null,
            name: account?.name ?? null,
          },
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
        resources_found: repositories.length,
        completed_at: now,
      })
      .eq("id", runId);
    if (runError) throw runError;

    return NextResponse.redirect(
      new URL(
        `/dashboard/recursos-externos?synced=${repositories.length}`,
        request.url,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo sincronizar GitHub.";
    if (runId) {
      const supabase = createAdminClient();
      await supabase
        .from("sync_runs")
        .update({
          status: "failed",
          error: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }
    return NextResponse.redirect(
      new URL(
        `/dashboard/integraciones?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
