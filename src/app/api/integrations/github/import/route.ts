import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardUser } from "@/lib/integrations/auth";

type GithubPayload = {
  externalId: string;
  owner: string;
  name: string;
  url: string;
  description: string | null;
  defaultBranch: string | null;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  detectedTechnologies: string[];
  languages: Record<string, number>;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    await requireDashboardUser();
    const resourceId = (await request.formData()).get("resource_id");
    if (typeof resourceId !== "string" || !resourceId)
      throw new Error("Recurso inválido.");

    const supabase = createAdminClient();
    const resourceResult = await supabase
      .from("external_resources")
      .select("id,name,description,payload,availability")
      .eq("id", resourceId)
      .eq("provider", "github")
      .single();
    if (resourceResult.error) throw resourceResult.error;
    if (resourceResult.data.availability === "ignored")
      throw new Error("El repositorio está ignorado.");

    const payload = resourceResult.data.payload as unknown as GithubPayload;
    const baseSlug =
      slugify(resourceResult.data.name) || `proyecto-${resourceId.slice(0, 8)}`;
    const existing = await supabase
      .from("projects")
      .select("slug")
      .like("slug", `${baseSlug}%`);
    if (existing.error) throw existing.error;
    const used = new Set((existing.data ?? []).map((row) => row.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (used.has(slug)) slug = `${baseSlug}-${suffix++}`;

    const projectResult = await supabase
      .from("projects")
      .insert({
        title: resourceResult.data.name,
        slug,
        short_description: resourceResult.data.description,
        description: null,
        technologies: payload.detectedTechnologies ?? [],
        categories: [],
        status: "en-desarrollo",
        published: false,
        featured: false,
        repository_url: payload.url,
        github_metadata: {
          repositoryUrl: payload.url,
          owner: payload.owner,
          name: payload.name,
          defaultBranch: payload.defaultBranch,
          description: payload.description,
          primaryLanguage: payload.primaryLanguage,
          languages: payload.languages ?? {},
          topics: payload.topics ?? [],
          stars: payload.stars,
          forks: payload.forks,
          lastUpdated: payload.updatedAt,
          detectedTechnologies: payload.detectedTechnologies ?? [],
        },
        github_synced_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (projectResult.error) throw projectResult.error;

    const { error: connectionError } = await supabase
      .from("external_connections")
      .insert({
        project_id: projectResult.data.id,
        resource_id: resourceId,
        provider: "github",
        match_method: "manual",
        match_confidence: "high",
        confirmed: true,
      });
    if (connectionError) throw connectionError;

    return NextResponse.redirect(new URL("/dashboard/proyectos", request.url));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo importar el repositorio.";
    return NextResponse.redirect(
      new URL(
        `/dashboard/recursos-externos?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
