import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileLinkRow = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

const PROFILE_COLUMNS =
  "id,full_name,headline,bio,avatar_url,email,phone,location,website,linkedin_url,github_url,created_at,updated_at";
const PROFILE_LINK_COLUMNS = "id,label,url,icon,sort_order,created_at";

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    email: row.email,
    phone: row.phone,
    location: row.location,
    website: row.website,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfileLink(row: ProfileLinkRow): ProfileLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    icon: row.icon,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function getProfileLinks(): Promise<ProfileLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_links")
    .select(PROFILE_LINK_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProfileLinkRow[]).map(mapProfileLink);
}

export async function getProfileAdmin(): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function getProfileLinksAdmin(): Promise<ProfileLink[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profile_links")
    .select(PROFILE_LINK_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProfileLinkRow[]).map(mapProfileLink);
}
