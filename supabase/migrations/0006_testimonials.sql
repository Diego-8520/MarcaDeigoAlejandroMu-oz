-- Testimonios manuales de clientes, vinculables opcionalmente a proyectos.

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  project_id uuid references projects(id) on delete set null,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "public read published testimonials" on testimonials
  for select using (published = true);