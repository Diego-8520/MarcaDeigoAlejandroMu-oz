-- =========================================================
-- CV DOCUMENTS & STORAGE
-- =========================================================

create table if not exists cv_documents (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  storage_path text not null,
  is_visible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Índice para consultas públicas ordenadas por visibilidad y prioridad
create index if not exists cv_documents_visible_sort_idx
  on cv_documents (is_visible, sort_order asc, created_at desc);

-- Row Level Security
alter table cv_documents enable row level security;

-- Lectura pública solo para documentos marcados como visibles
create policy "public read visible cv_documents" on cv_documents
  for select using (is_visible = true);

-- Bucket de almacenamiento para CVs (público para descarga directa)
insert into storage.buckets (id, name, public)
values ('cv', 'cv', true)
on conflict (id) do nothing;
