-- EIA · persistencia de los votos 👍/👎 por pregunta (señal de claridad).
-- Ejecutar en el SQL Editor de Supabase. Es idempotente.
--
-- Hasta ahora el 👍/👎 solo iba a Google Analytics. Esta tabla guarda cada
-- voto para poder ver los conteos por herramienta / sección / pregunta en el
-- panel de feedback, sin depender de GA4.
--
-- Nota de privacidad: NO se guarda correo ni ningún dato personal. Por eso
-- la anon key SÍ puede leer (SELECT) esta tabla — solo hay señales agregables.

create table if not exists public.tool_question_vote (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  tool         text,
  question_id  text,
  pregunta     text,        -- numeración visible, ej. '6.2'
  seccion      text,        -- ej. '06 Protección de datos'
  helpful      boolean not null  -- true = 👍 (fue clara), false = 👎 (no fue clara)
);

comment on table public.tool_question_vote is
  'Votos 👍/👎 de claridad por pregunta. Sin datos personales. Una fila por voto.';

create index if not exists tool_question_vote_qid_idx     on public.tool_question_vote (question_id);
create index if not exists tool_question_vote_tool_idx    on public.tool_question_vote (tool);
create index if not exists tool_question_vote_helpful_idx on public.tool_question_vote (helpful);

alter table public.tool_question_vote enable row level security;

-- La herramienta escribe con la anon key.
drop policy if exists "anon puede insertar votos" on public.tool_question_vote;
create policy "anon puede insertar votos"
  on public.tool_question_vote for insert to anon with check (true);

-- Al no haber datos personales, se permite la lectura anónima (para el panel).
drop policy if exists "anon puede leer votos" on public.tool_question_vote;
create policy "anon puede leer votos"
  on public.tool_question_vote for select to anon using (true);
