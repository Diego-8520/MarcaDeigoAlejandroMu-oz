"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { importImageFromUrl } from "@/actions/project-images";
import type { ProjectActionState } from "@/actions/projects";
import type { Project } from "@/types/project";
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
  suggestedDescription: string;
  suggestedTechnologies: string[];
  topics: string[];
  lastCommitDate: string | null;
  stars: number;
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

function mergeList(current: string, additions: string[]) {
  const existing = current
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set(existing.map((item) => item.toLowerCase()));

  for (const item of additions) {
    const normalized = item.trim();
    if (normalized && !seen.has(normalized.toLowerCase())) {
      existing.push(normalized);
      seen.add(normalized.toLowerCase());
    }
  }

  return existing.join(", ");
}

function isGithubUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "") === "github.com";
  } catch {
    return false;
  }
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
    if (!repositoryUrl || !isGithubUrl(repositoryUrl)) return;

    setGithubStatus({ loading: true, error: null });
    const { data, error } = await fetchSuggestion<GithubSuggestion>(
      "/api/dashboard/github-metadata",
      { repositoryUrl },
    );
    setGithubSuggestion(data);
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
    setTechnologies(
      mergeList(technologies, [
        ...githubSuggestion.suggestedTechnologies,
        ...githubSuggestion.topics,
      ]),
    );
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
            onChange={(event) => setRepositoryUrl(event.target.value)}
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
            {[
              ...githubSuggestion.suggestedTechnologies,
              ...githubSuggestion.topics,
            ]
              .slice(0, 12)
              .join(", ") || "sin tecnologías detectadas"}
          </p>
          <p className="mt-2 font-mono text-[11px] text-ink-muted">
            {githubSuggestion.stars} stars
            {githubSuggestion.lastCommitDate
              ? ` · último cambio ${new Date(
                  githubSuggestion.lastCommitDate,
                ).toLocaleDateString("es-CO")}`
              : ""}
          </p>
          <button
            type="button"
            onClick={applyGithubSuggestion}
            className="mt-4 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal"
          >
            aplicar sugerencias
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
