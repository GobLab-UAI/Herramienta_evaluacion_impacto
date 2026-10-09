-- EIA · vínculos entre registros: usuario ↔ feedback / encuesta / votos y
-- voto ↔ comentario por pregunta. Ejecutar en el SQL Editor de Supabase.
-- Es idempotente: se puede correr varias veces sin romper nada.
--
-- 1. `user_id` (FK → tool_users) en tool_feedback, tool_survey y
--    tool_question_vote. Solo se llena si el correo está en tool_users, es decir,
--    si la persona marcó "Acepto recibir novedades…" al ingresar. Sin
--    consentimiento queda NULL y el registro no se puede asociar a la persona.
-- 2. `vote_id` (FK → tool_question_vote) en tool_feedback: el comentario de una
--    pregunta queda unido al 👍/👎 desde el que se escribió.
-- 3. `eia_user_id(email, tool)`: función que devuelve SOLO el id del usuario.
--    Así el servidor resuelve el vínculo sin que la anon key pueda leer
--    tool_users (que guarda correos).
--
-- tool_users es compartida por varias herramientas GobLab y no se creó desde
-- este repo, por eso su clave primaria (nombre y tipo) se detecta al vuelo.

do $$
declare
  pk_col  text;
  pk_type text;
begin
  select a.attname, format_type(a.atttypid, a.atttypmod)
    into pk_col, pk_type
    from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any (i.indkey)
   where i.indrelid = 'public.tool_users'::regclass
     and i.indisprimary
   limit 1;

  if pk_col is null then
    alter table public.tool_users add column if not exists id uuid default gen_random_uuid();
    update public.tool_users set id = gen_random_uuid() where id is null;
    alter table public.tool_users add primary key (id);
    pk_col  := 'id';
    pk_type := 'uuid';
  end if;

  -- user_id con el mismo tipo que la PK de tool_users.
  execute format(
    'alter table public.tool_feedback add column if not exists user_id %s references public.tool_users (%I) on delete set null',
    pk_type, pk_col);
  execute format(
    'alter table public.tool_survey add column if not exists user_id %s references public.tool_users (%I) on delete set null',
    pk_type, pk_col);
  execute format(
    'alter table public.tool_question_vote add column if not exists user_id %s references public.tool_users (%I) on delete set null',
    pk_type, pk_col);

  -- Resolución correo → id, sin exponer la tabla. Devuelve texto: PostgREST lo
  -- convierte al tipo de la columna user_id al insertar.
  execute format($f$
    create or replace function public.eia_user_id(p_email text, p_tool text)
    returns text
    language sql
    stable
    security definer
    set search_path = public
    as $body$
      select %I::text
        from public.tool_users
       where lower(email) = lower(trim(p_email))
         and tool_name = p_tool
       limit 1
    $body$
  $f$, pk_col);
end $$;

revoke all on function public.eia_user_id(text, text) from public;
grant execute on function public.eia_user_id(text, text) to anon;

-- Comentario por pregunta ↔ voto 👍/👎 que lo originó.
alter table public.tool_feedback
  add column if not exists vote_id uuid references public.tool_question_vote (id) on delete set null;

create index if not exists tool_feedback_user_id_idx      on public.tool_feedback (user_id);
create index if not exists tool_feedback_vote_id_idx      on public.tool_feedback (vote_id);
create index if not exists tool_survey_user_id_idx        on public.tool_survey (user_id);
create index if not exists tool_question_vote_user_id_idx on public.tool_question_vote (user_id);

comment on column public.tool_feedback.user_id is
  'Usuario de tool_users (solo si aceptó recibir novedades al ingresar).';
comment on column public.tool_feedback.vote_id is
  'Voto 👍/👎 de tool_question_vote desde el que se escribió el comentario.';
comment on column public.tool_survey.user_id is
  'Usuario de tool_users (solo si aceptó recibir novedades al ingresar).';
comment on column public.tool_question_vote.user_id is
  'Usuario de tool_users (solo si aceptó recibir novedades al ingresar).';

-- Vista de apoyo: cada comentario por pregunta junto a su voto y al usuario
-- registrado (si lo hay). Sin políticas para anon: se consulta desde el panel
-- de Supabase o con service role.
create or replace view public.eia_feedback_completo
with (security_invoker = true) as
select
  f.*,
  v.helpful    as voto_claridad,   -- true = 👍, false = 👎, null = sin voto
  v.created_at as voto_at
from public.tool_feedback f
left join public.tool_question_vote v on v.id = f.vote_id;
