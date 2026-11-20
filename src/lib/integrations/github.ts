import { getGithubToken } from "@/lib/integrations/github-token";

const GITHUB_API = "https://api.github.com";

type GithubRepository = {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  private: boolean;
  visibility: string | null;
  default_branch: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  archived: boolean;
  fork: boolean;
  license: { spdx_id: string | null } | null;
};

export type ExternalGithubRepository = {
  externalId: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  visibility: string;
  defaultBranch: string | null;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  archived: boolean;
  fork: boolean;
  license: string | null;
  languages: Record<string, number>;
  readmeAvailable: boolean;
};

function headers(token: string | null, accept = "application/vnd.github+json") {
  const result: Record<string, string> = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) result.Authorization = `Bearer ${token}`;
  return result;
}

export class GithubRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GithubRequestError";
  }
}

async function githubFetch<T>(
  path: string,
  token: string | null,
  options: { accept?: string; as?: "json" | "text" } = {},
): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: headers(token, options.accept),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GithubRequestError(
      response.status === 401
        ? "La conexión de GitHub expiró o fue revocada."
        : `GitHub respondió con estado ${response.status}.`,
      response.status,
    );
  }

  return (options.as === "text"
    ? await response.text()
    : await response.json()) as T;
}

function mapRepository(
  repository: GithubRepository,
): Omit<ExternalGithubRepository, "languages" | "readmeAvailable"> {
  return {
    externalId: String(repository.id),
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    url: repository.html_url,
    description: repository.description,
    visibility:
      repository.visibility ?? (repository.private ? "private" : "public"),
    defaultBranch: repository.default_branch,
    primaryLanguage: repository.language,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    createdAt: repository.created_at,
    updatedAt: repository.updated_at,
    pushedAt: repository.pushed_at,
    archived: repository.archived,
    fork: repository.fork,
    license: repository.license?.spdx_id ?? null,
  };
}

/** El token no existe en este navegador o GitHub lo rechazó: hay que reconectar. */
export class GithubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GithubAuthError";
  }
}

async function requireGithubToken() {
  const token = await getGithubToken();
  if (!token) {
    throw new GithubAuthError(
      "No hay una sesión de GitHub activa en este navegador. Pulsa «reconectar».",
    );
  }
  return token;
}

export async function getGithubRepositories() {
  const token = await requireGithubToken();

  const repositories: ExternalGithubRepository[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await githubFetch<GithubRepository[]>(
      `/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=updated&per_page=100&page=${page}`,
      token,
    );
    const mapped = await Promise.all(
      batch.map(async (repository) => {
        const base = mapRepository(repository);
        const [languages, readme] = await Promise.all([
          // Un repo inaccesible (403/404/451) no debe abortar todo el inventario.
          githubFetch<Record<string, number>>(
            `/repos/${repository.owner.login}/${repository.name}/languages`,
            token,
          ).catch((error: unknown) => {
            if (error instanceof GithubRequestError && error.status === 401) {
              throw error;
            }
            return {} as Record<string, number>;
          }),
          fetch(
            `${GITHUB_API}/repos/${repository.owner.login}/${repository.name}/readme`,
            { headers: headers(token), cache: "no-store" },
          ).catch(() => null),
        ]);
        return {
          ...base,
          languages,
          readmeAvailable: Boolean(readme?.ok),
        };
      }),
    );
    repositories.push(...mapped);
    if (batch.length < 100) break;
  }

  return repositories;
}

export async function getGithubAccount() {
  const token = await requireGithubToken();
  return githubFetch<{ login: string; name: string | null }>("/user", token);
}

export type RepositoryReadme = {
  owner: string;
  name: string;
  markdown: string | null;
  homepage: string | null;
  topics: string[];
  languages: Record<string, number>;
  defaultBranch: string;
};

/** Extrae `{ owner, name }` de una URL de GitHub (https, ssh o `owner/name`). */
export function parseRepositoryUrl(url: string) {
  const value = url.trim();
  const ssh = value.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (ssh) return { owner: ssh[1], name: ssh[2] };

  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (parsed.hostname.replace(/^www\./, "").toLowerCase() !== "github.com") {
      return null;
    }
    const [owner, rawName] = parsed.pathname.split("/").filter(Boolean);
    const name = rawName?.replace(/\.git$/, "");
    if (!owner || !name) return null;
    return { owner, name };
  } catch {
    return null;
  }
}

/**
 * Lee el README crudo del repo y los datos del repo útiles para la ficha.
 * Usa el token de GitHub conectado si existe; si no, consulta anónima
 * (solo repos públicos). `markdown` es null cuando el repo no tiene README.
 */
export async function getRepositoryReadme(
  owner: string,
  name: string,
): Promise<RepositoryReadme> {
  const token = await getGithubToken();
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;

  const repository = await githubFetch<{
    homepage: string | null;
    topics?: string[];
    default_branch: string | null;
    owner: { login: string };
    name: string;
  }>(base, token);

  const [languages, markdown] = await Promise.all([
    githubFetch<Record<string, number>>(`${base}/languages`, token).catch(
      () => ({}) as Record<string, number>,
    ),
    githubFetch<string>(`${base}/readme`, token, {
      accept: "application/vnd.github.raw+json",
      as: "text",
    }).catch((error: unknown) => {
      if (error instanceof GithubRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }),
  ]);

  return {
    owner: repository.owner.login,
    name: repository.name,
    markdown,
    homepage: repository.homepage?.trim() || null,
    topics: repository.topics ?? [],
    languages,
    defaultBranch: repository.default_branch ?? "main",
  };
}
