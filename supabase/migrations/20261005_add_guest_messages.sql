-- MelissArte Photos
-- Guest text and audio messages

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  message_type text not null check (message_type in ('text', 'audio')),
  author_name text,
  content text,
  file_path text,
  public_url text,
  duration_seconds integer,
  created_at timestamptz not null default now(),

  constraint messages_author_name_length
    check (author_name is null or char_length(author_name) <= 80),

  constraint messages_duration_range
    check (
      duration_seconds is null
      or duration_seconds between 1 and 60
    ),

  constraint messages_content_or_audio
    check (
      (
        message_type = 'text'
        and content is not null
        and char_length(trim(content)) between 1 and 300
        and file_path is null
        and public_url is null
        and duration_seconds is null
      )
      or
      (
        message_type = 'audio'
        and content is null
        and file_path is not null
        and public_url is not null
        and duration_seconds between 1 and 60
      )
    )
);

create index if not exists messages_event_id_created_at_idx
  on public.messages (event_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Public can read messages from published events"
  on public.messages;

create policy "Public can read messages from published events"
  on public.messages
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.events
      where events.id = messages.event_id
        and events.status = 'published'
    )
  );

drop policy if exists "Guests can create messages for published events"
  on public.messages;

create policy "Guests can create messages for published events"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.events
      where events.id = messages.event_id
        and events.status = 'published'
    )
  );

insert into storage.buckets (id, name, public)
values ('event-messages', 'event-messages', true)
on conflict (id) do update
set public = true;

drop policy if exists "Public can read event message audio"
  on storage.objects;

create policy "Public can read event message audio"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'event-messages'
  );

drop policy if exists "Guests can upload event message audio"
  on storage.objects;

create policy "Guests can upload event message audio"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'event-messages'
    and (storage.foldername(name))[2] = 'audio'
    and exists (
      select 1
      from public.events
      where events.id::text = (storage.foldername(name))[1]
        and events.status = 'published'
    )
  );
