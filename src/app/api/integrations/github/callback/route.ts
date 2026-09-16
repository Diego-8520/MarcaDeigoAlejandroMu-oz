import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";
import {
  saveGithubToken,
  consumeGithubOauthState,
} from "@/lib/integrations/github-token";

export async function GET(request: NextRequest) {
  const redirect = (params: Record<string, string>) => {
    const url = new URL("/dashboard/integraciones", request.url);
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
    return NextResponse.redirect(url);
  };

  try {
    await requireDashboardUser();
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code || !state || !(await consumeGithubOauthState(state))) {
      return redirect({
        error: "La validación de GitHub expiró o no es válida.",
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Faltan las variables OAuth de GitHub.");
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
        cache: "no-store",
      },
    );
    const tokenJson = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };
    if (!tokenResponse.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error ?? "GitHub no devolvió un token válido.");
    }

    await saveGithubToken(tokenJson.access_token);
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenJson.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    const profile = (await profileResponse.json()) as {
      login?: string;
      name?: string | null;
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("integration_connections").upsert(
      {
        provider: "github",
        account_label: profile.login ? `@${profile.login}` : null,
        status: "connected",
        metadata: { login: profile.login ?? null, name: profile.name ?? null },
        sync_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" },
    );
    if (error) throw error;

    return redirect({ connected: "github" });
  } catch (error) {
    return redirect({
      error:
        error instanceof Error ? error.message : "No se pudo conectar GitHub.",
    });
  }
}
