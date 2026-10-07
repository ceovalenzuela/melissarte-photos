-- Limit guest written messages to 180 characters.

alter table public.messages
  drop constraint if exists messages_content_or_audio;

alter table public.messages
  add constraint messages_content_or_audio
  check (
    (
      message_type = 'text'
      and content is not null
      and char_length(trim(content)) between 1 and 180
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
  );
