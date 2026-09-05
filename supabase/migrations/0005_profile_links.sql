-- Enlaces sociales extensibles del único perfil del sitio.

create table if not exists profile_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table profile_links enable row level security;

create policy "public read profile_links" on profile_links
  for select using (true);

-- No hay FK a profiles porque el sitio soporta un único perfil.