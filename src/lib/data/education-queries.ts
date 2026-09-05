import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Education = {
  id: string;
  institution: string;
  program: string;
  startDate: string;
  endDate: string | null;
  status: string | null;
  description: string | null;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  credentialUrl: string | null;
};

type EducationRow = {
  id: string;
  institution: string;
  program: string;
  start_date: string;
  end_date: string | null;
  status: string | null;
  description: string | null;
};

type CertificationRow = {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
};

const EDUCATION_COLUMNS =
  "id,institution,program,start_date,end_date,status,description";
const CERTIFICATION_COLUMNS = "id,name,issuer,issue_date,credential_url";

function mapEducation(row: EducationRow): Education {
  return {
    id: row.id,
    institution: row.institution,
    program: row.program,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    description: row.description,
  };
}

function mapCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    issueDate: row.issue_date,
    credentialUrl: row.credential_url,
  };
}

export async function getEducation(): Promise<Education[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education")
    .select(EDUCATION_COLUMNS)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as EducationRow[]).map(mapEducation);
}

export async function getCertifications(): Promise<Certification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_COLUMNS)
    .order("issue_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CertificationRow[]).map(mapCertification);
}

export async function getEducationAdmin(): Promise<Education[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("education")
    .select(EDUCATION_COLUMNS)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as EducationRow[]).map(mapEducation);
}

export async function getCertificationsAdmin(): Promise<Certification[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_COLUMNS)
    .order("issue_date", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CertificationRow[]).map(mapCertification);
}

export async function getEducationByIdAdmin(
  id: string,
): Promise<Education | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("education")
    .select(EDUCATION_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEducation(data as EducationRow) : null;
}

export async function getCertificationByIdAdmin(
  id: string,
): Promise<Certification | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("certifications")
    .select(CERTIFICATION_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCertification(data as CertificationRow) : null;
}
