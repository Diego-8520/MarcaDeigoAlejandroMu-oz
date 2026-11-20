const CALLBACK_PATH = "/api/integrations/github/callback";

/**
 * URL de retorno del OAuth de GitHub.
 *
 * GitHub solo acepta `redirect_uri` dentro de la "Authorization callback URL"
 * registrada en la OAuth App. Como el dominio raíz redirige a www, derivarla
 * del host de la petición hace que falle según por dónde entró el usuario.
 * `GITHUB_OAUTH_REDIRECT_URI` fija la URL exacta registrada; sin ella se usa
 * el origen de la petición (útil en local).
 */
export function githubRedirectUri(request: Request) {
  const configured = process.env.GITHUB_OAUTH_REDIRECT_URI?.trim();
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      throw new Error("GITHUB_OAUTH_REDIRECT_URI no es una URL válida.");
    }
  }
  return new URL(CALLBACK_PATH, new URL(request.url).origin);
}

/** Traduce los códigos de error de OAuth de GitHub a mensajes accionables. */
export function describeGithubOauthError(
  code: string,
  description?: string | null,
) {
  switch (code) {
    case "redirect_uri_mismatch":
      return "La URL de retorno no coincide con la registrada en la OAuth App de GitHub. Revisa la «Authorization callback URL» y GITHUB_OAUTH_REDIRECT_URI.";
    case "access_denied":
      return "Cancelaste la autorización en GitHub.";
    case "application_suspended":
      return "La OAuth App de GitHub está suspendida.";
    case "incorrect_client_credentials":
      return "GITHUB_CLIENT_ID o GITHUB_CLIENT_SECRET son incorrectos.";
    case "bad_verification_code":
      return "El código de GitHub expiró o ya se usó. Vuelve a conectar.";
    default:
      return description || `GitHub devolvió el error «${code}».`;
  }
}
