-- Permitir NULL en github_metadata para proyectos que no tienen repositorio o metadatos sincronizados
alter table projects
  alter column github_metadata drop not null;
