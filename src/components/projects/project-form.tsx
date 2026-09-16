"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { importImageFromUrl } from "@/actions/project-images";
import type { ProjectActionState } from "@/actions/projects";
import type { GithubMetadata, Project } from "@/types/project";
import type { Skill } from "@/lib/data/skills-queries";

type ProjectFormProps = {
  action: (
    prevState: ProjectActionState,
    formData: FormData,
  ) => Promise<ProjectActionState>;
  project?: Project;
  skills?: Skill[];
  selectedSkillIds?: string[];
  submitLabel: string;
};

type GithubSuggestion = {
  repositoryUrl: string;
  owner: string;
  name: string;
  defaultBranch: string | null;
  suggestedDescription: string;
  suggestedTechnologies: string[];
  primaryLanguage: string | null;
  languages: Record<string, number>;
  packageTechnologies: string[];
  topics: string[];
  lastCommitDate: string | null;
  updatedAt: string | null;
  stars: number;
  forks: number;
};

type SiteSuggestion = {
  suggestedTitle: string;
  suggestedDescription: string;
  ogImageUrl: string | null;
};

const initialState: ProjectActionState = { status: "idle" };

function listValue(items?: string[]) {
  return items?.join(", ") ?? "";
}

function isGithubUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "") === "github.com";
  } catch {
    return false;
  }
}

function sameGithubRepository(first: string, second: string) {
  return first.replace(/\/$/, "").toLowerCase() === second.replace(/\/$/, "").toLowerCase();
}

async function fetchSuggestion<T>(
  endpoint: string,
  payload: Record<string, string>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        data: null,
        error: json.message ?? "No pude traer sugerencias.",
      };
    }

    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "No pude traer sugerencias." };
  }
}

export function ProjectForm({
  action,
  project,
  skills = [],
  selectedSkillIds = [],
  submitLabel,
}: ProjectFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isImportingImage, startImageImportTransition] = useTransition();
  const [title, setTitle] = useState(project?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    project?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(project?.description ?? "");
  const [problem, setProblem] = useState(project?.problem ?? "");
  const [solution, setSolution] = useState(project?.solution ?? "");
  const [results, setResults] = useState(project?.results ?? "");
  const [technologies, setTechnologies] = useState(
    listValue(project?.technologies),
  );
  const [categories, setCategories] = useState(listValue(project?.categories));
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl ?? "");
  const [repositoryUrl, setRepositoryUrl] = useState(
    project?.repositoryUrl ?? "",
  );
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    project?.featuredImageUrl ?? "",
  );
  const [githubMetadata, setGithubMetadata] = useState<GithubMetadata | null>(
    project?.githubMetadata ?? null,
  );
  const [githubSyncedAt, setGithubSyncedAt] = useState(
    project?.githubSyncedAt ?? "",
  );
  const [vercelProjectUrl, setVercelProjectUrl] = useState(
    project?.vercelProjectUrl ?? "",
  );
  const [vercelProductionUrl, setVercelProductionUrl] = useState(
    project?.vercelProductionUrl ?? "",
  );
  const [vercelCustomDomain, setVercelCustomDomain] = useState(
    project?.vercelCustomDomain ?? "",
  );
  const [vercelDeploymentStatus, setVercelDeploymentStatus] = useState(
    project?.vercelDeploymentStatus ?? "",
  );
  const [selectedSkills, setSelectedSkills] = useState(selectedSkillIds);
  const [githubSuggestion, setGithubSuggestion] =
    useState<GithubSuggestion | null>(null);
  const [siteSuggestion, setSiteSuggestion] = useState<SiteSuggestion | null>(
    null,
  );
  const [githubStatus, setGithubStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const [siteStatus, setSiteStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const [imageImportMessage, setImageImportMessage] = useState<string | null>(
    null,
  );

  async function loadGithubSuggestion() {
    if (!repositoryUrl) {
      setGithubStatus({ loading: false, error: "Ingresa una URL de GitHub." });
      return;
    }
    if (!isGithubUrl(repositoryUrl)) {
      setGithubStatus({
        loading: false,
        error: "La URL debe ser de GitHub, con formato github.com/owner/repo.",
      });
      return;
    }

    setGithubStatus({ loading: true, error: null });
    const { data, error } = await fetchSuggestion<GithubSuggestion>(
      "/api/dashboard/github-metadata",
      { repositoryUrl },
    );
    setGithubSuggestion(data);
    if (data) {
      setGithubMetadata({
        repositoryUrl: data.repositoryUrl,
        owner: data.owner,
        name: data.name,
        defaultBranch: data.defaultBranch,
        description: data.suggestedDescription || null,
        primaryLanguage: data.primaryLanguage,
        languages: data.languages,
        topics: data.topics,
        stars: data.stars,
        forks: data.forks,
        lastUpdated: data.updatedAt ?? data.lastCommitDate,
        detectedTechnologies: [
          ...data.packageTechnologies,
          ...data.suggestedTechnologies,
        ].filter((item, index, list) => list.indexOf(item) === index),
      });
      setGithubSyncedAt(new Date().toISOString());
    }
    setGithubStatus({ loading: false, error });
  }

  async function loadSiteSuggestion() {
    if (!demoUrl) return;

    setSiteStatus({ loading: true, error: null });
    const { data, error } = await fetchSuggestion<SiteSuggestion>(
      "/api/dashboard/site-metadata",
      { demoUrl },
    );
    setSiteSuggestion(data);
    setSiteStatus({ loading: false, error });
  }

  function applyGithubSuggestion() {
    if (!githubSuggestion) return;

    if (!shortDescription && githubSuggestion.suggestedDescription) {
      setShortDescription(githubSuggestion.suggestedDescription);
    }
    if (!description && githubSuggestion.suggestedDescription) {
      setDescription(githubSuggestion.suggestedDescription);
    }
  }

  function applySiteSuggestion() {
    if (!siteSuggestion) return;

    if (!title && siteSuggestion.suggestedTitle) {
      setTitle(siteSuggestion.suggestedTitle);
    }
    if (!shortDescription && siteSuggestion.suggestedDescription) {
      setShortDescription(siteSuggestion.suggestedDescription);
    }
    if (!description && siteSuggestion.suggestedDescription) {
      setDescription(siteSuggestion.suggestedDescription);
    }
    if (!featuredImageUrl && siteSuggestion.ogImageUrl) {
      setFeaturedImageUrl(siteSuggestion.ogImageUrl);
    }
  }

  function importSiteImage() {
    if (!project?.id || !siteSuggestion?.ogImageUrl) return;

    startImageImportTransition(async () => {
      const result = await importImageFromUrl(
        project.id,
        siteSuggestion.ogImageUrl ?? "",
        title || siteSuggestion.suggestedTitle,
      );
      setImageImportMessage(result.message ?? null);
      router.refresh();
    });
  }

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <input
        type="hidden"
        name="github_metadata"
        value={githubMetadata ? JSON.stringify(githubMetadata) : ""}
        readOnly
      />
      <input
        type="hidden"
        name="github_synced_at"
        value={githubSyncedAt}
        readOnly
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="font-mono text-xs text-ink-muted">
            título
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>

        <div>
          <label htmlFor="slug" className="font-mono text-xs text-ink-muted">
            slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={project?.slug}
            placeholder="se-genera-si-viene-vacio"
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="short_description"
          className="font-mono text-xs text-ink-muted"
        >
          descripción corta
        </label>
        <input
          id="short_description"
          name="short_description"
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="font-mono text-xs text-ink-muted"
        >
          descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="problem" className="font-mono text-xs text-ink-muted">
            problema
          </label>
          <textarea
            id="problem"
            name="problem"
            rows={4}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>

        <div>
          <label
            htmlFor="solution"
            className="font-mono text-xs text-ink-muted"
          >
            solución
          </label>
          <textarea
            id="solution"
            name="solution"
            rows={4}
            value={solution}
            onChange={(event) => setSolution(event.target.value)}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>
      </div>

      <div>
        <label htmlFor="results" className="font-mono text-xs text-ink-muted">
          resultados
        </label>
        <textarea
          id="results"
          name="results"
          rows={4}
          value={results}
          onChange={(event) => setResults(event.target.value)}
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="technologies"
            className="font-mono text-xs text-ink-muted"
          >
            tecnologías
          </label>
          <input
            id="technologies"
            name="technologies"
            value={technologies}
            onChange={(event) => setTechnologies(event.target.value)}
            placeholder="Next.js, Supabase, OpenAI"
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>

        <div>
          <label
            htmlFor="categories"
            className="font-mono text-xs text-ink-muted"
          >
            categorías
          </label>
          <input
            id="categories"
            name="categories"
            value={categories}
            onChange={(event) => setCategories(event.target.value)}
            placeholder="Web Apps, AI"
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className="font-mono text-xs text-ink-muted">
            estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "en-desarrollo"}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          >
            <option value="live">live</option>
            <option value="en-desarrollo">en-desarrollo</option>
            <option value="archivado">archivado</option>
          </select>
        </div>

        <label className="flex items-center gap-2 pt-6 font-mono text-xs text-ink-muted">
          <input
            name="published"
            type="checkbox"
            defaultChecked={project?.published ?? false}
            className="size-4 accent-signal"
          />
          publicado
        </label>

        <label className="flex items-center gap-2 pt-6 font-mono text-xs text-ink-muted">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={project?.featured ?? false}
            className="size-4 accent-signal"
          />
          destacado
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="demo_url"
            className="font-mono text-xs text-ink-muted"
          >
            demo url
          </label>
          <input
            id="demo_url"
            name="demo_url"
            type="url"
            value={demoUrl}
            onChange={(event) => setDemoUrl(event.target.value)}
            onBlur={loadSiteSuggestion}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
          {siteStatus.loading && (
            <p className="mt-1.5 font-mono text-xs text-ink-muted">
              buscando...
            </p>
          )}
          {siteStatus.error && (
            <p className="mt-1.5 font-mono text-xs text-red-600">
              {siteStatus.error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="repository_url"
            className="font-mono text-xs text-ink-muted"
          >
            repository url
          </label>
          <input
            id="repository_url"
            name="repository_url"
            type="url"
            value={repositoryUrl}
            onChange={(event) => {
              const nextRepositoryUrl = event.target.value;
              setRepositoryUrl(nextRepositoryUrl);
              if (
                githubMetadata &&
                !sameGithubRepository(githubMetadata.repositoryUrl, nextRepositoryUrl)
              ) {
                setGithubMetadata(null);
                setGithubSuggestion(null);
                setGithubSyncedAt("");
              }
            }}
            onBlur={loadGithubSuggestion}
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
          {githubStatus.loading && (
            <p className="mt-1.5 font-mono text-xs text-ink-muted">
              buscando...
            </p>
          )}
          {githubStatus.error && (
            <p className="mt-1.5 font-mono text-xs text-red-600">
              {githubStatus.error}
            </p>
          )}
          <button
            type="button"
            onClick={loadGithubSuggestion}
            disabled={githubStatus.loading || !repositoryUrl}
            className="mt-2 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
          >
            {githubStatus.loading ? "sincronizando..." : "sincronizar github"}
          </button>
        </div>
      </div>

      {githubSuggestion && (
        <div className="border border-line p-4">
          <p className="font-mono text-xs text-ink-muted">
            sugerencia desde github
          </p>
          {githubSuggestion.suggestedDescription && (
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              {githubSuggestion.suggestedDescription}
            </p>
          )}
          <p className="mt-3 font-mono text-xs text-ink-muted">
            detectadas:{" "}
            {[
              ...githubSuggestion.packageTechnologies,
              ...githubSuggestion.suggestedTechnologies,
            ]
              .slice(0, 12)
              .join(", ") || "ninguna"}
          </p>
          <p className="mt-2 font-mono text-[11px] text-ink-muted">
            {githubSuggestion.owner}/{githubSuggestion.name} · rama{" "}
            {githubSuggestion.defaultBranch ?? "sin definir"} ·{" "}
            {githubSuggestion.forks} forks
          </p>
          <p className="mt-2 font-mono text-[11px] text-ink-muted">
            lenguajes:{" "}
            {Object.keys(githubSuggestion.languages).join(", ") || "ninguno"}
          </p>
          <p className="mt-2 font-mono text-[11px] text-ink-muted">
            {githubSuggestion.stars} stars
            {(githubSuggestion.updatedAt ?? githubSuggestion.lastCommitDate)
              ? ` · actualizado ${new Date(
                  githubSuggestion.updatedAt ??
                    githubSuggestion.lastCommitDate!,
                ).toLocaleDateString("es-CO")}`
              : ""}
          </p>
          <button
            type="button"
            onClick={applyGithubSuggestion}
            className="mt-4 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal"
          >
            usar descripción detectada
          </button>
        </div>
      )}

      {siteSuggestion && (
        <div className="border border-line p-4">
          <p className="font-mono text-xs text-ink-muted">
            sugerencia desde sitio
          </p>
          {(siteSuggestion.suggestedTitle ||
            siteSuggestion.suggestedDescription) && (
            <div className="mt-2 space-y-1">
              {siteSuggestion.suggestedTitle && (
                <p className="font-body text-sm font-medium text-ink">
                  {siteSuggestion.suggestedTitle}
                </p>
              )}
              {siteSuggestion.suggestedDescription && (
                <p className="font-body text-sm leading-relaxed text-ink-muted">
                  {siteSuggestion.suggestedDescription}
                </p>
              )}
            </div>
          )}
          {siteSuggestion.ogImageUrl && (
            <div className="mt-4">
              <div className="relative aspect-video w-full overflow-hidden border border-line bg-white/40">
                <Image
                  src={siteSuggestion.ogImageUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setFeaturedImageUrl(siteSuggestion.ogImageUrl ?? "")
                }
                className="mt-3 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal"
              >
                usar imagen destacada
              </button>
              {project?.id && (
                <button
                  type="button"
                  onClick={importSiteImage}
                  disabled={isImportingImage}
                  className="ml-2 mt-3 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
                >
                  {isImportingImage ? "importando..." : "importar a galería"}
                </button>
              )}
            </div>
          )}
          {imageImportMessage && (
            <p className="mt-3 font-mono text-xs text-ink-muted">
              {imageImportMessage}
            </p>
          )}
          <button
            type="button"
            onClick={applySiteSuggestion}
            className="mt-4 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal"
          >
            aplicar sugerencias
          </button>
        </div>
      )}

      <div className="border-t border-line pt-5">
        <p className="font-mono text-xs text-ink-muted">vercel (manual)</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <input
            aria-label="URL del proyecto de Vercel"
            name="vercel_project_url"
            type="url"
            placeholder="URL del proyecto Vercel"
            value={vercelProjectUrl}
            onChange={(event) => setVercelProjectUrl(event.target.value)}
            className="w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
          <input
            aria-label="URL de producción"
            name="vercel_production_url"
            type="url"
            placeholder="URL de producción"
            value={vercelProductionUrl}
            onChange={(event) => setVercelProductionUrl(event.target.value)}
            className="w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
          <input
            aria-label="Dominio personalizado"
            name="vercel_custom_domain"
            placeholder="Dominio personalizado"
            value={vercelCustomDomain}
            onChange={(event) => setVercelCustomDomain(event.target.value)}
            className="w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
          <input
            aria-label="Estado del deployment"
            name="vercel_deployment_status"
            placeholder="Estado del deployment (opcional)"
            value={vercelDeploymentStatus}
            onChange={(event) => setVercelDeploymentStatus(event.target.value)}
            className="w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="featured_image_url"
          className="font-mono text-xs text-ink-muted"
        >
          imagen destacada url
        </label>
        <input
          id="featured_image_url"
          name="featured_image_url"
          type="url"
          value={featuredImageUrl}
          onChange={(event) => setFeaturedImageUrl(event.target.value)}
          className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      <div>
        <p className="font-mono text-xs text-ink-muted">skills del proyecto</p>
        {skills.length === 0 ? (
          <p className="mt-2 font-body text-sm text-ink-muted">
            Crea skills desde el dashboard para poder vincularlas.
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-center gap-2 font-mono text-xs text-ink-muted"
              >
                <input
                  type="checkbox"
                  name="skill_ids"
                  value={skill.id}
                  checked={selectedSkills.includes(skill.id)}
                  onChange={(event) => {
                    setSelectedSkills((current) =>
                      event.target.checked
                        ? [...current, skill.id]
                        : current.filter((id) => id !== skill.id),
                    );
                  }}
                  className="size-4 accent-signal"
                />
                {skill.name}
                {skill.category && (
                  <span className="text-ink-muted">· {skill.category}</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
      >
        {isPending ? "guardando..." : submitLabel}
      </button>

      {state.status !== "idle" && (
        <p
          className={`font-mono text-xs ${
            state.status === "success" ? "text-signal" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
