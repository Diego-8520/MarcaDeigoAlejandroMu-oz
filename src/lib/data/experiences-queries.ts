import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  achievements: string[];
};

type ExperienceRow = {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  achievements: string[] | null;
};

const EXPERIENCE_COLUMNS =
  "id,company,position,start_date,end_date,description,achievements";

function mapExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    company: row.company,
    position: row.position,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    achievements: row.achievements ?? [],
  };
}

export async function getExperiences(): Promise<Experience[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ExperienceRow[]).map(mapExperience);
}

export async function getExperiencesAdmin(): Promise<Experience[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ExperienceRow[]).map(mapExperience);
}

export async function getExperienceAdmin(
  id: string,
): Promise<Experience | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapExperience(data as ExperienceRow) : null;
}
