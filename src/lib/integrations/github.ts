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

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: headers(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "La conexión de GitHub expiró o fue revocada."
        : `GitHub respondió con estado ${response.status}.`,
    );
  }

  return (await response.json()) as T;
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

export async function getGithubRepositories() {
  const token = await getGithubToken();
  if (!token) {
    throw new Error("Conecta GitHub antes de sincronizar repositorios.");
  }

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
          githubFetch<Record<string, number>>(
            `/repos/${repository.owner.login}/${repository.name}/languages`,
            token,
          ),
          fetch(
            `${GITHUB_API}/repos/${repository.owner.login}/${repository.name}/readme`,
            { headers: headers(token), cache: "no-store" },
          ),
        ]);
        return {
          ...base,
          languages,
          readmeAvailable: readme.ok,
        };
      }),
    );
    repositories.push(...mapped);
    if (batch.length < 100) break;
  }

  return repositories;
}

export async function getGithubAccount() {
  const token = await getGithubToken();
  if (!token) return null;
  return githubFetch<{ login: string; name: string | null }>("/user", token);
}
