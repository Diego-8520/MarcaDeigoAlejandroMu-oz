create table if not exists external_resource_links (
  id uuid primary key default gen_random_uuid(),
  source_resource_id uuid not null references external_resources(id) on delete cascade,
  target_resource_id uuid not null references external_resources(id) on delete cascade,
  relation text not null check (relation in ('linked-repository', 'production-deployment', 'backend')),
  match_method text not null check (match_method in ('exact-link', 'owner-repository', 'url', 'manual')),
  match_confidence text not null check (match_confidence in ('high', 'medium', 'low')),
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_resource_id, target_resource_id, relation)
);

create index if not exists external_resource_links_source_idx
  on external_resource_links (source_resource_id, relation);
create index if not exists external_resource_links_target_idx
  on external_resource_links (target_resource_id, relation);

alter table external_resource_links enable row level security;