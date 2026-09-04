import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type GithubRepoResponse = {
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string | null;
  message?: string;
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
      { status: 429 }
    );
  }

  if (response.status === 404) {
    return NextResponse.json(
      { message: "No encontré ese repositorio. Puede no existir o ser privado." },
      { status: 404 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "No pude consultar GitHub en este momento." },
      { status: response.status }
    );
  }

  return null;
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
      { status: 400 }
    );
  }

  const repository = parseGithubRepositoryUrl(repositoryUrl);
  if (!repository) {
    return NextResponse.json(
      { message: "La URL debe ser de GitHub, con formato github.com/owner/repo." },
      { status: 400 }
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
  const suggestedTechnologies = [
    repo.language,
    ...Object.keys(languages).sort((a, b) => languages[b] - languages[a]),
  ].filter((item, index, list): item is string => Boolean(item) && list.indexOf(item) === index);

  return NextResponse.json({
    suggestedDescription: repo.description ?? "",
    suggestedTechnologies,
    topics: repo.topics ?? [],
    lastCommitDate: repo.pushed_at,
    stars: repo.stargazers_count,
  });
}
