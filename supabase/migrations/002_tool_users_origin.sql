-- EIA · guardar la respuesta de "¿Desde dónde participas?" del formulario de
-- entrada. Hasta ahora el dato se pedía en la landing y se descartaba.
--
-- `tool_users` es compartida por todas las herramientas GobLab, por eso la
-- columna es nullable: las herramientas que no preguntan el origen siguen
-- insertando igual que antes.
--
-- Es idempotente: se puede correr varias veces sin romper nada.

alter table public.tool_users
  add column if not exists origin text;

comment on column public.tool_users.origin is
  'Tipo de organización desde la que participa la persona (organismo público, '
  'empresa privada, institución académica, sociedad civil, persona '
  'independiente). Nullable: solo lo envían las herramientas que lo preguntan.';
