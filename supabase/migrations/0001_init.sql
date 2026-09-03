-- Esquema inicial (Fase 1) para diegoalejandromunoz.com
-- Ver sección 13 (base de datos) y 18 (seguridad) del documento maestro.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text,
  bio text,
  avatar_url text,
  email text,
  phone text,
  location text,
  website text,
  linkedin_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PROJECTS
-- =========================================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  problem text,
  solution text,
  results text,
  status text not null default 'en-desarrollo',
  featured boolean not null default false,
  published boolean not null default false,
  demo_url text,
  repository_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0
);

-- =========================================================
-- SKILLS
-- =========================================================
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text
);

create table if not exists project_skills (
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

-- =========================================================
-- EXPERIENCE / EDUCATION
-- =========================================================
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  start_date date,
  end_date date,
  description text,
  achievements text[]
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  program text not null,
  start_date date,
  end_date date,
  status text,
  description text
);

-- =========================================================
-- SERVICES / CERTIFICATIONS
-- =========================================================
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price text,
  published boolean not null default false
);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  issue_date date,
  credential_url text
);

-- =========================================================
-- CONTACTS / LEADS
-- =========================================================
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  request_type text not null,
  message text not null,
  status text not null default 'nuevo',
  notes text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ANALYTICS
-- =========================================================
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  page text not null,
  project_id uuid references projects(id) on delete set null,
  session_id text not null,
  source text,
  device_type text,
  country text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- AI ASSISTANT / RAG
-- =========================================================
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table skills enable row level security;
alter table project_skills enable row level security;
alter table experiences enable row level security;
alter table education enable row level security;
alter table services enable row level security;
alter table certifications enable row level security;
alter table contacts enable row level security;
alter table analytics_events enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table knowledge_chunks enable row level security;

-- Lectura pública de contenido publicado
create policy "public read published projects" on projects
  for select using (published = true);

create policy "public read project_images" on project_images
  for select using (
    exists (select 1 from projects p where p.id = project_images.project_id and p.published = true)
  );

create policy "public read skills" on skills for select using (true);
create policy "public read project_skills" on project_skills for select using (true);
create policy "public read experiences" on experiences for select using (true);
create policy "public read education" on education for select using (true);
create policy "public read published services" on services for select using (published = true);
create policy "public read certifications" on certifications for select using (true);
create policy "public read profiles" on profiles for select using (true);

-- Escritura pública SOLO para insertar (nunca leer) contactos y eventos
create policy "public insert contacts" on contacts for insert with check (true);
create policy "public insert analytics_events" on analytics_events for insert with check (true);

-- Todo lo demás (update/delete, lectura de contacts/analytics, y todas las
-- tablas de administración) queda reservado a `service_role`, usado desde
-- Server Actions / Route Handlers autenticados como admin. No se define
-- policy adicional para authenticated: el acceso admin pasa por el cliente
-- con SUPABASE_SERVICE_ROLE_KEY (ver src/lib/supabase/admin.ts), que
-- bypassa RLS por diseño de Supabase.
