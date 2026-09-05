import { createAdminClient } from "@/lib/supabase/admin";

export const CONTACT_STATUSES = [
  "nuevo",
  "en-seguimiento",
  "cerrado",
  "descartado",
] as const;

export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  requestType: string;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  request_type: string;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const CONTACT_COLUMNS =
  "id,name,email,company,request_type,message,status,notes,created_at";

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    requestType: row.request_type,
    message: row.message,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getContactsAdmin(status?: string): Promise<Contact[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("contacts")
    .select(CONTACT_COLUMNS)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as ContactRow[]).map(mapContact);
}
