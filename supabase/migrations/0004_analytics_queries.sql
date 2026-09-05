-- Consultas agregadas para el dashboard privado de analytics.

create or replace function get_analytics_metrics_summary(p_days int)
returns table (
  page_views bigint,
  unique_sessions bigint,
  project_views bigint,
  cv_downloads bigint,
  contact_submits bigint
)
language sql
stable
as $$
  select
    count(*) filter (where event_type = 'page_view'),
    count(distinct session_id),
    count(*) filter (where event_type = 'project_view'),
    count(*) filter (where event_type = 'cv_download'),
    count(*) filter (where event_type = 'contact_submit')
  from analytics_events
  where created_at >= now() - make_interval(days => greatest(p_days, 0));
$$;

create or replace function get_analytics_top_pages(p_days int, p_limit int)
returns table (page text, visits bigint)
language sql
stable
as $$
  select page, count(*)
  from analytics_events
  where event_type = 'page_view'
    and created_at >= now() - make_interval(days => greatest(p_days, 0))
  group by page
  order by count(*) desc, page asc
  limit greatest(least(p_limit, 50), 1);
$$;

create or replace function get_analytics_top_referrers(p_days int, p_limit int)
returns table (source text, visits bigint)
language sql
stable
as $$
  select
    coalesce(nullif(trim(source), ''), 'directo') as source,
    count(*)
  from analytics_events
  where event_type = 'page_view'
    and created_at >= now() - make_interval(days => greatest(p_days, 0))
  group by coalesce(nullif(trim(source), ''), 'directo')
  order by count(*) desc, source asc
  limit greatest(least(p_limit, 50), 1);
$$;

create or replace function get_analytics_visits_by_country(p_days int)
returns table (country text, visits bigint)
language sql
stable
as $$
  select
    coalesce(nullif(trim(country), ''), 'desconocido') as country,
    count(*)
  from analytics_events
  where event_type = 'page_view'
    and created_at >= now() - make_interval(days => greatest(p_days, 0))
  group by coalesce(nullif(trim(country), ''), 'desconocido')
  order by count(*) desc, country asc
  limit 50;
$$;

create or replace function get_analytics_visits_by_device(p_days int)
returns table (device_type text, visits bigint)
language sql
stable
as $$
  select
    coalesce(nullif(trim(device_type), ''), 'desconocido') as device_type,
    count(*)
  from analytics_events
  where event_type = 'page_view'
    and created_at >= now() - make_interval(days => greatest(p_days, 0))
  group by coalesce(nullif(trim(device_type), ''), 'desconocido')
  order by count(*) desc, device_type asc
  limit 10;
$$;

create or replace function get_analytics_top_projects(p_days int, p_limit int)
returns table (project_id uuid, title text, visits bigint)
language sql
stable
as $$
  select ae.project_id, p.title, count(*)
  from analytics_events ae
  join projects p on p.id = ae.project_id
  where ae.event_type = 'project_view'
    and ae.project_id is not null
    and ae.created_at >= now() - make_interval(days => greatest(p_days, 0))
  group by ae.project_id, p.title
  order by count(*) desc, p.title asc
  limit greatest(least(p_limit, 50), 1);
$$;

create or replace function get_analytics_visits_time_series(p_days int)
returns table (day date, visits bigint)
language sql
stable
as $$
  with days as (
    select generate_series(
      current_date - greatest(p_days, 1) + 1,
      current_date,
      interval '1 day'
    )::date as day
  )
  select
    days.day,
    count(ae.id) as visits
  from days
  left join analytics_events ae
    on ae.created_at >= days.day::timestamptz
    and ae.created_at < (days.day + 1)::timestamptz
    and ae.event_type = 'page_view'
  group by days.day
  order by days.day asc;
$$;