import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { saveGithubOauthState } from "@/lib/integrations/github-token";

export async function GET(request: Request) {
  try {
    await requireDashboardUser();
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_CLIENT_ID no está configurada.");

    const state = randomUUID();
    await saveGithubOauthState(state);
    const redirectUri = new URL(
      "/api/integrations/github/callback",
      request.url,
    );
    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri.toString());
    authorizeUrl.searchParams.set("scope", "read:user public_repo");
    authorizeUrl.searchParams.set("state", state);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo conectar GitHub.";
    return NextResponse.redirect(
      new URL(
        `/dashboard/integraciones?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
