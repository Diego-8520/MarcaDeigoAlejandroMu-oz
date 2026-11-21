-- =========================================================
-- BUSCADOR DE EMPLEO (privado, solo panel)
-- Vacantes guardadas, su análisis de compatibilidad y el estado de la
-- postulación. RLS activado SIN políticas: solo se accede con la service
-- role desde el servidor, tras verificar ADMIN_EMAILS.
-- =========================================================

create table if not exists job_postings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('getonboard', 'remotive', 'adzuna', 'jooble', 'manual')),
  external_id text not null,
  title text not null,
  company text,
  location text,
  modality text check (modality in ('remoto', 'hibrido', 'presencial')),
  salary text,
  description text not null default '',
  url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);

create table if not exists job_analyses (
  job_id uuid primary key references job_postings(id) on delete cascade,
  version int not null,
  score int not null check (score between 0 and 100),
  -- Huella de la HV usada; si cambia tu HV, el análisis se recalcula.
  cv_fingerprint text not null,
  result jsonb not null,
  analyzed_at timestamptz not null default now()
);

create table if not exists job_applications (
  job_id uuid primary key references job_postings(id) on delete cascade,
  status text not null default 'guardada'
    check (status in ('guardada', 'postulada', 'entrevista', 'oferta', 'rechazada', 'descartada')),
  applied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_applications_status_idx on job_applications (status, updated_at desc);
create index if not exists job_postings_created_idx on job_postings (created_at desc);

alter table job_postings enable row level security;
alter table job_analyses enable row level security;
alter table job_applications enable row level security;

-- Sin políticas: anon y authenticated no pueden leer ni escribir.
revoke all on job_postings, job_analyses, job_applications from anon, authenticated;
