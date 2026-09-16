alter table projects
  add column if not exists github_metadata jsonb not null default '{}'::jsonb;

alter table projects
  add column if not exists github_synced_at timestamptz;

alter table projects
  add column if not exists vercel_project_url text;

alter table projects
  add column if not exists vercel_production_url text;

alter table projects
  add column if not exists vercel_custom_domain text;

alter table projects
  add column if not exists vercel_deployment_status text;