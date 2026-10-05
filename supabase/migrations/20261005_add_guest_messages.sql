-- MelissArte Photos
-- Guest text and audio messages

create or replace function public.is_published_event(
  p_event_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events
    where id = p_event_id
      and status = 'published'
  );
$$;

revoke all on function public.is_published_event(uuid) from public;
grant execute on function public.is_published_event(uuid) to anon, authenticated;

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
  using (public.is_published_event(event_id));

drop policy if exists "Guests can create messages for published events"
  on public.messages;

create policy "Guests can create messages for published events"
  on public.messages
  for insert
  to anon, authenticated
  with check (public.is_published_event(event_id));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'event-messages',
  'event-messages',
  true,
  1048576,
  array[
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/x-m4a'
  ]::text[]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = excluded.allowed_mime_types;

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
    and public.is_published_event(
      nullif((storage.foldername(name))[1], '')::uuid
    )
  );

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  )
  and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end
$$;

-- Admin access: the existing admin is authenticated with Supabase Auth.
drop policy if exists "Authenticated users can read all event messages"
  on public.messages;

create policy "Authenticated users can read all event messages"
  on public.messages
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists "Authenticated users can delete event messages"
  on public.messages;

create policy "Authenticated users can delete event messages"
  on public.messages
  for delete
  to authenticated
  using (auth.uid() is not null);

drop policy if exists "Authenticated users can delete event message audio"
  on storage.objects;

create policy "Authenticated users can delete event message audio"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event-messages'
  );
