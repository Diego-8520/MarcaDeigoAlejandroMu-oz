-- Capturas automáticas de proyectos.
-- Cambios solo aditivos (columnas nuevas con default o null): el código
-- anterior sigue funcionando mientras esta migración ya está aplicada.

alter table public.project_images
  add column if not exists kind text not null default 'upload'
    check (kind in ('upload', 'desktop', 'mobile', 'section')),
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'auto')),
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists caption text;

alter table public.projects
  add column if not exists screenshots_status text
    check (screenshots_status in ('pending', 'ready', 'failed')),
  add column if not exists screenshots_error text,
  add column if not exists screenshots_captured_at timestamptz;
