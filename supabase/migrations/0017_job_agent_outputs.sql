-- =========================================================
-- RESULTADOS DEL AGENTE (Claude Code): HV adaptada y evaluación de oferta.
-- Se generan con /adaptar-hv y /evaluar-oferta y se guardan con
-- `npm run empleo:guardar`, que valida antes que no haya nada inventado.
-- RLS activado SIN políticas: solo service role.
-- =========================================================

create table if not exists job_agent_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references job_postings(id) on delete cascade,
  kind text not null check (kind in ('hv', 'evaluacion')),
  content jsonb not null,
  -- Huella de la HV usada; el panel avisa si tu HV cambió después.
  cv_fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists job_agent_outputs_job_idx on job_agent_outputs (job_id, kind, created_at desc);

alter table job_agent_outputs enable row level security;
revoke all on job_agent_outputs from anon, authenticated;
