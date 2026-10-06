-- Melissarte Photos
-- Job de limpieza: elimina eventos y sus archivos 30 días después de la fecha del evento.
--
-- Antes de ejecutar:
-- 1) Despliega la Edge Function:
--    cleanup-expired-events
-- 2) Crea en Supabase Vault:
--    - project_url: https://TU-PROJECT-REF.supabase.co
--    - cleanup_cron_secret: una cadena aleatoria larga
-- 3) Configura CRON_SECRET en los secrets de la Edge Function
--    con exactamente el mismo valor de cleanup_cron_secret.
--
-- Este job se ejecuta diariamente a las 09:00 UTC.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid)
from cron.job
where jobname = 'cleanup-expired-events-daily';

select cron.schedule(
  'cleanup-expired-events-daily',
  '0 9 * * *',
  $job$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'project_url'
      ) || '/functions/v1/cleanup-expired-events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'cleanup_cron_secret'
        )
      ),
      body := jsonb_build_object(
        'trigger', 'cleanup-expired-events'
      )
    ) as request_id;
  $job$
);
