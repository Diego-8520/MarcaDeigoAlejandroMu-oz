import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  quote: string;
  projectId: string | null;
  projectTitle: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
};

type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  quote: string;
  project_id: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  projects?: { title: string } | { title: string }[] | null;
};

const TESTIMONIAL_COLUMNS =
  "id,author_name,author_role,author_company,quote,project_id,published,sort_order,created_at";
const ADMIN_TESTIMONIAL_COLUMNS = `${TESTIMONIAL_COLUMNS},projects(title)`;

function mapTestimonial(row: TestimonialRow): Testimonial {
  const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;

  return {
    id: row.id,
    authorName: row.author_name,
    authorRole: row.author_role,
    authorCompany: row.author_company,
    quote: row.quote,
    projectId: row.project_id,
    projectTitle: project?.title ?? null,
    published: row.published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function normalizedLimit(limit: number) {
  return Math.min(Math.max(Math.floor(limit), 1), 50);
}

export async function getPublishedTestimonials(
  limit = 6,
): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(normalizedLimit(limit));

  if (error) throw error;
  return ((data ?? []) as TestimonialRow[]).map(mapTestimonial);
}

export async function getTestimonialsByProject(
  projectId: string,
): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_COLUMNS)
    .eq("project_id", projectId)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as TestimonialRow[]).map(mapTestimonial);
}

export async function getAllTestimonialsAdmin(): Promise<Testimonial[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(ADMIN_TESTIMONIAL_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as TestimonialRow[]).map(mapTestimonial);
}

export async function getTestimonialAdmin(
  id: string,
): Promise<Testimonial | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(ADMIN_TESTIMONIAL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTestimonial(data as TestimonialRow) : null;
}
