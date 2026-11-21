import { isAdminEmail } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import {
  GithubRequestError,
  getRepositoryReadme,
  parseRepositoryUrl,
} from "@/lib/integrations/github";
import { parseReadme } from "@/lib/projects/readme-parser";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user: isAdminEmail(user?.email) ? user : null };
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
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

  const repository = parseRepositoryUrl(repositoryUrl);
  if (!repository) {
    return NextResponse.json(
      {
        message:
          "La URL debe ser de GitHub, con formato github.com/owner/repo.",
      },
      { status: 400 },
    );
  }

  try {
    const readme = await getRepositoryReadme(repository.owner, repository.name);
    if (!readme.markdown?.trim()) {
      return NextResponse.json(
        { message: "Repositorio sin README" },
        { status: 404 },
      );
    }

    // Tecnologías ya usadas en el portafolio: fijan la grafía canónica.
    const { data: rows } = await supabase.from("projects").select("technologies");
    const knownTechnologies = (rows ?? []).flatMap(
      (row: { technologies: string[] | null }) => row.technologies ?? [],
    );

    return NextResponse.json(
      parseReadme(readme.markdown, {
        owner: readme.owner,
        name: readme.name,
        defaultBranch: readme.defaultBranch,
        homepage: readme.homepage,
        topics: readme.topics,
        languages: readme.languages,
        knownTechnologies,
      }),
    );
  } catch (error) {
    if (error instanceof GithubRequestError) {
      if (error.status === 404 || error.status === 401) {
        return NextResponse.json(
          { message: "Repo privado: conecta GitHub en Integraciones" },
          { status: 404 },
        );
      }
      if (error.status === 403 || error.status === 429) {
        return NextResponse.json(
          {
            message:
              "GitHub alcanzó el límite de consultas. Conecta GitHub en Integraciones o intenta más tarde.",
          },
          { status: 429 },
        );
      }
    }
    return NextResponse.json(
      { message: "No pude leer el README en este momento." },
      { status: 502 },
    );
  }
}
