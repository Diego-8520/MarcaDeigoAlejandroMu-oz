import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type GithubRepoResponse = {
  name: string;
  html_url: string;
  default_branch: string | null;
  owner: { login: string };
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  pushed_at: string | null;
};

function parseGithubRepositoryUrl(repositoryUrl: string) {
  try {
    const url = new URL(repositoryUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname !== "github.com") return null;

    const [owner, repoWithSuffix] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repoWithSuffix) return null;

    const repo = repoWithSuffix.replace(/\.git$/, "");
    if (!repo) return null;

    return { owner, repo };
  } catch {
    return null;
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function githubHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function parseGithubResponse(response: Response) {
  const remaining = response.headers.get("x-ratelimit-remaining");

  if (response.status === 403 && remaining === "0") {
    return NextResponse.json(
      {
        message:
          "GitHub alcanzó el límite de consultas. Configura GITHUB_TOKEN o intenta más tarde.",
      },
      { status: 429 },
    );
  }

  if (response.status === 404) {
    return NextResponse.json(
      {
        message: "No encontré ese repositorio. Puede no existir o ser privado.",
      },
      { status: 404 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "No pude consultar GitHub en este momento." },
      { status: response.status },
    );
  }

  return null;
}

async function detectPackageTechnologies(
  repoUrl: string,
  headers: HeadersInit,
) {
  const response = await fetch(`${repoUrl}/contents/package.json`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) return [];

  const payload = (await response.json().catch(() => null)) as {
    content?: string;
    encoding?: string;
  } | null;
  if (!payload?.content || payload.encoding !== "base64") return [];

  try {
    const packageJson = JSON.parse(
      Buffer.from(payload.content, "base64").toString("utf8"),
    ) as {
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
    };
    return [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ]
      .filter((name, index, list) => list.indexOf(name) === index)
      .slice(0, 24);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    repositoryUrl?: string;
  } | null;
  const repositoryUrl = body?.repositoryUrl;

  if (!repositoryUrl) {
    return NextResponse.json(
      { message: "Envía la URL del repositorio." },
      { status: 400 },
    );
  }

  const repository = parseGithubRepositoryUrl(repositoryUrl);
  if (!repository) {
    return NextResponse.json(
      {
        message:
          "La URL debe ser de GitHub, con formato github.com/owner/repo.",
      },
      { status: 400 },
    );
  }

  const repoUrl = `https://api.github.com/repos/${repository.owner}/${repository.repo}`;
  const languagesUrl = `${repoUrl}/languages`;
  const headers = githubHeaders();

  const [repoResponse, languagesResponse] = await Promise.all([
    fetch(repoUrl, { headers, cache: "no-store" }),
    fetch(languagesUrl, { headers, cache: "no-store" }),
  ]);

  const repoError = await parseGithubResponse(repoResponse);
  if (repoError) return repoError;

  const languagesError = await parseGithubResponse(languagesResponse);
  if (languagesError) return languagesError;

  const repo = (await repoResponse.json()) as GithubRepoResponse;
  const languages = (await languagesResponse.json()) as Record<string, number>;
  const packageTechnologies = await detectPackageTechnologies(repoUrl, headers);
  const suggestedTechnologies = [
    repo.language,
    ...Object.keys(languages).sort((a, b) => languages[b] - languages[a]),
  ].filter(
    (item, index, list): item is string =>
      Boolean(item) && list.indexOf(item) === index,
  );

  return NextResponse.json({
    repositoryUrl: repo.html_url,
    owner: repo.owner.login,
    name: repo.name,
    defaultBranch: repo.default_branch,
    suggestedDescription: repo.description ?? "",
    primaryLanguage: repo.language,
    languages,
    suggestedTechnologies,
    packageTechnologies,
    topics: repo.topics ?? [],
    lastCommitDate: repo.pushed_at,
    updatedAt: repo.updated_at,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  });
}
