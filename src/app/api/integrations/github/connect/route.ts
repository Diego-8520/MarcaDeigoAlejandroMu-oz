import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/integrations/auth";
import { saveGithubOauthState } from "@/lib/integrations/github-token";
import { githubRedirectUri } from "@/lib/integrations/github-oauth";

export async function GET(request: Request) {
  try {
    await requireDashboardUser();
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_CLIENT_ID no está configurada.");

    // La cookie de estado debe quedar en el mismo host que recibirá el
    // callback; si el usuario entró por otro dominio, se reinicia allí.
    const redirectUri = githubRedirectUri(request);
    const requestUrl = new URL(request.url);
    if (redirectUri.origin !== requestUrl.origin) {
      return NextResponse.redirect(
        new URL(requestUrl.pathname, redirectUri.origin),
      );
    }

    const state = randomUUID();
    await saveGithubOauthState(state);
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
