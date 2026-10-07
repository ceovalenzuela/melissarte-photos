-- Melissarte Photos
-- Marca cuándo el contenido de un evento fue purgado.
-- El registro del evento se conserva para historial/administración.

alter table public.events
  add column if not exists content_purged_at timestamptz;

create index if not exists events_content_purged_at_idx
  on public.events (content_purged_at);
