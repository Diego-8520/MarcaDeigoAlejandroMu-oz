import type { Project, ProjectImage, ProjectStatus } from "@/types/project";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  results: string | null;
  status: ProjectStatus;
  featured: boolean;
  published: boolean;
  demo_url: string | null;
  repository_url: string | null;
  featured_image_url: string | null;
  technologies: string[] | null;
  categories: string[] | null;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImageRow[];
};

type ProjectImageRow = {
  id: string;
  project_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
};

const PROJECT_COLUMNS =
  "id,title,slug,short_description,description,problem,solution,results,status,featured,published,demo_url,repository_url,featured_image_url,technologies,categories,created_at,updated_at";
const PROJECT_IMAGE_COLUMNS = "id,project_id,storage_path,alt_text,sort_order";
const PROJECT_WITH_IMAGES_COLUMNS = `${PROJECT_COLUMNS},project_images(${PROJECT_IMAGE_COLUMNS})`;
const PROJECT_IMAGES_BUCKET = "project-images";

function storageObjectPath(storagePath: string) {
  return storagePath.startsWith(`${PROJECT_IMAGES_BUCKET}/`)
    ? storagePath.slice(PROJECT_IMAGES_BUCKET.length + 1)
    : storagePath;
}

function imagePublicUrl(storagePath: string) {
  const supabase = createAdminClient();
  const { data } = supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .getPublicUrl(storageObjectPath(storagePath));

  return data.publicUrl;
}

export function mapProjectImage(row: ProjectImageRow): ProjectImage {
  return {
    id: row.id,
    projectId: row.project_id,
    storagePath: row.storage_path,
    publicUrl: imagePublicUrl(row.storage_path),
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    problem: row.problem ?? undefined,
    solution: row.solution ?? undefined,
    results: row.results,
    status: row.status,
    featured: row.featured,
    published: row.published,
    demoUrl: row.demo_url,
    repositoryUrl: row.repository_url,
    featuredImageUrl: row.featured_image_url,
    technologies: row.technologies ?? [],
    categories: row.categories ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: row.project_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map(mapProjectImage),
  };
}

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_WITH_IMAGES_COLUMNS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ProjectRow[]).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_WITH_IMAGES_COLUMNS)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProject(data as ProjectRow) : null;
}

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_images")
    .select(PROJECT_IMAGE_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProjectImageRow[]).map(mapProjectImage);
}

export async function getProjectImagesAdmin(
  projectId: string
): Promise<ProjectImage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_images")
    .select(PROJECT_IMAGE_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProjectImageRow[]).map(mapProjectImage);
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ProjectRow[]).map(mapProject);
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProject(data as ProjectRow) : null;
}
