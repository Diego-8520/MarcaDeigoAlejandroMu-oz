-- Inventario técnico separado del contenido editorial de projects.
create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('github', 'vercel', 'supabase')),
  account_label text,
  status text not null default 'pending'
    check (status in ('pending', 'connected', 'disconnected', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider)
);

create table if not exists external_resources (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('github', 'vercel', 'supabase')),
  resource_type text not null,
  external_id text not null,
  owner_label text,
  name text not null,
  description text,
  visibility text,
  availability text not null default 'available'
    check (availability in ('available', 'ignored', 'unavailable')),
  payload jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, resource_type, external_id)
);

create table if not exists external_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  resource_id uuid not null references external_resources(id) on delete cascade,
  provider text not null check (provider in ('github', 'vercel', 'supabase')),
  match_method text not null default 'manual'
    check (match_method in ('exact-link', 'owner-repository', 'url', 'name', 'manual')),
  match_confidence text not null default 'high'
    check (match_confidence in ('high', 'medium', 'low')),
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, resource_id),
  unique (project_id, provider)
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('github', 'vercel', 'supabase', 'all')),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  resources_found integer not null default 0,
  connections_found integer not null default 0,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists external_resources_provider_idx
  on external_resources (provider, availability, updated_at desc);
create index if not exists external_connections_project_idx
  on external_connections (project_id, provider);
create index if not exists sync_runs_provider_idx
  on sync_runs (provider, started_at desc);

alter table integration_connections enable row level security;
alter table external_resources enable row level security;
alter table external_connections enable row level security;
alter table sync_runs enable row level security;