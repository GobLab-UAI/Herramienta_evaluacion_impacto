-- EIA · persistencia estructurada de la encuesta de satisfacción y del
-- contexto del feedback. Ejecutar en el SQL Editor de Supabase.
--
-- Es idempotente: se puede correr varias veces sin romper nada.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Encuesta de satisfacción — una fila por respuesta, una columna por
--    pregunta, para poder promediar las escalas y filtrar sin parsear texto.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.tool_survey (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  tool                text,
  email               text,
  progreso            smallint,                    -- % de avance del cuestionario

  -- Escalas Likert 1-7
  p2_facilidad_uso    smallint check (p2_facilidad_uso    between 1 and 7),
  p3_orientacion      smallint check (p3_orientacion      between 1 and 7),
  p4_participacion    smallint check (p4_participacion    between 1 and 7),
  p5_adecuacion       smallint check (p5_adecuacion       between 1 and 7),
  p6_lenguaje         smallint check (p6_lenguaje         between 1 and 7),
  p7_recomendaciones  smallint check (p7_recomendaciones  between 1 and 7),

  -- Sí / No y texto abierto
  p8_recomendaria     text,
  p9_falta_tema       text,
  p9_detalle          text,
  p10_comentario      text,

  -- Interés en acompañamiento (+ contacto opcional)
  p11_acompanamiento  text,
  p11_nombre          text,
  p11_apellido        text,
  p11_correo          text
);

comment on table public.tool_survey is
  'Encuesta de satisfacción de las herramientas GobLab (EIA). Una fila por envío.';

alter table public.tool_survey enable row level security;

-- La herramienta escribe con la anon key; solo se permite insertar.
--
-- A propósito NO se crea política de SELECT: la tabla guarda datos de contacto
-- (p11_nombre / p11_apellido / p11_correo) y no debe poder leerse con la anon
-- key. Para analizar los resultados usa el panel de Supabase o una service
-- role key, que no pasan por RLS.
--
-- Consecuencia esperada: un SELECT con anon devuelve vacío aunque haya filas.
-- Para verificar que la escritura funciona sin poder leer:
--   node scripts/eia-gen/check-supabase.mjs --write
drop policy if exists "anon puede insertar encuestas" on public.tool_survey;
create policy "anon puede insertar encuestas"
  on public.tool_survey for insert to anon with check (true);

create index if not exists tool_survey_created_at_idx on public.tool_survey (created_at desc);
create index if not exists tool_survey_tool_idx       on public.tool_survey (tool);

-- ─────────────────────────────────────────────────────────────────────
-- 2. Contexto del feedback — hoy viaja incrustado en `description`.
--    Estas columnas lo dejan consultable sin tocar lo ya guardado.
-- ─────────────────────────────────────────────────────────────────────
alter table public.tool_feedback add column if not exists pantalla    text;
alter table public.tool_feedback add column if not exists seccion     text;
alter table public.tool_feedback add column if not exists pregunta    text;
alter table public.tool_feedback add column if not exists question_id text;
alter table public.tool_feedback add column if not exists progreso    smallint;

create index if not exists tool_feedback_question_id_idx on public.tool_feedback (question_id);
create index if not exists tool_feedback_pantalla_idx    on public.tool_feedback (pantalla);
