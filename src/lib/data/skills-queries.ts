import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Skill = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
};

type SkillRow = Skill;
type ProjectSkillRow = { skill_id: string; skills: Skill | Skill[] | null };

const SKILL_COLUMNS = "id,name,category,description";

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select(SKILL_COLUMNS)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SkillRow[];
}

export async function getSkillsAdmin(): Promise<Skill[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("skills")
    .select(SKILL_COLUMNS)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SkillRow[];
}

export async function getSkillsByProject(projectId: string): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_skills")
    .select(`skill_id,skills(${SKILL_COLUMNS})`)
    .eq("project_id", projectId);

  if (error) throw error;
  return ((data ?? []) as ProjectSkillRow[])
    .map((row) => (Array.isArray(row.skills) ? row.skills[0] : row.skills))
    .filter((skill): skill is Skill => Boolean(skill));
}

export async function getSkillsByProjectAdmin(
  projectId: string,
): Promise<Skill[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_skills")
    .select(`skill_id,skills(${SKILL_COLUMNS})`)
    .eq("project_id", projectId);

  if (error) throw error;
  return ((data ?? []) as ProjectSkillRow[])
    .map((row) => (Array.isArray(row.skills) ? row.skills[0] : row.skills))
    .filter((skill): skill is Skill => Boolean(skill));
}

export async function linkSkillsToProject(
  projectId: string,
  skillIds: string[],
) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("project_skills")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) throw deleteError;

  const uniqueSkillIds = [...new Set(skillIds)];
  if (uniqueSkillIds.length === 0) return;

  const { error } = await supabase
    .from("project_skills")
    .insert(
      uniqueSkillIds.map((skillId) => ({
        project_id: projectId,
        skill_id: skillId,
      })),
    );
  if (error) throw error;
}
