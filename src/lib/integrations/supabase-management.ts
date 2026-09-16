const SUPABASE_API = "https://api.supabase.com";

type SupabaseProject = {
  id: string;
  ref: string;
  name: string;
  region: string;
  status: string;
  url?: string;
};

export async function getSupabaseProjects() {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  if (!token) throw new Error("SUPABASE_MANAGEMENT_TOKEN no está configurada.");
  const response = await fetch(`${SUPABASE_API}/v1/projects`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Supabase respondió con estado ${response.status}.`);
  return (await response.json()) as SupabaseProject[];
}
