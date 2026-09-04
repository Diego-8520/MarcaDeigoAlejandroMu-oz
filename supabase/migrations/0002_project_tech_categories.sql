alter table projects
  add column if not exists technologies text[] not null default '{}';

alter table projects
  add column if not exists categories text[] not null default '{}';
