import { createAdminClient } from "@/lib/supabase/admin";

export type ExternalResource = {
  id: string;
  provider: "github" | "vercel" | "supabase";
  resourceType: string;
  externalId: string;
  ownerLabel: string | null;
  name: string;
  description: string | null;
  visibility: string | null;
  availability: "available" | "ignored" | "unavailable";
  payload: Record<string, unknown>;
  lastSyncedAt: string | null;
};

type ExternalResourceRow = {
  id: string;
  provider: ExternalResource["provider"];
  resource_type: string;
  external_id: string;
  owner_label: string | null;
  name: string;
  description: string | null;
  visibility: string | null;
  availability: ExternalResource["availability"];
  payload: Record<string, unknown>;
  last_synced_at: string | null;
};

export async function getExternalResources(
  provider?: ExternalResource["provider"],
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("external_resources")
    .select(
      "id,provider,resource_type,external_id,owner_label,name,description,visibility,availability,payload,last_synced_at",
    )
    .order("updated_at", { ascending: false });
  if (provider) query = query.eq("provider", provider);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as ExternalResourceRow[]).map((row) => ({
    id: row.id,
    provider: row.provider,
    resourceType: row.resource_type,
    externalId: row.external_id,
    ownerLabel: row.owner_label,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    availability: row.availability,
    payload: row.payload,
    lastSyncedAt: row.last_synced_at,
  }));
}

export async function getIntegrationConnections() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("integration_connections")
    .select("provider,account_label,status,last_synced_at,sync_error")
    .order("provider");
  if (error) throw error;
  return data ?? [];
}
