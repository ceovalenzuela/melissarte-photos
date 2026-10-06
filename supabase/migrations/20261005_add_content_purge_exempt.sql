-- Permite excluir permanentemente un evento del proceso de purga automática.
-- Útil para eventos demo o de referencia que deben conservar su contenido.

alter table public.events
  add column if not exists content_purge_exempt boolean not null default false;

create index if not exists events_content_purge_exempt_idx
  on public.events (content_purge_exempt);
