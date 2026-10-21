# Solicitud de invitación: lista de despliegue

Esta rama agrega paletas específicas por evento, validaciones de fecha, protección con Cloudflare Turnstile, un límite de solicitudes persistente y limpieza de imágenes de solicitudes antiguas. No se deben desplegar los cambios de backend hasta completar esta configuración.

## Variables y secretos

1. Crear un widget de Cloudflare Turnstile de tipo administrado. Autorizar el dominio de producción `fotos.melissartedecorativo.com` y el host de vista previa que se vaya a probar.
2. Configurar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` en Vercel para Preview y Production. Es la clave pública del widget.
3. Configurar `TURNSTILE_SECRET_KEY` como secreto de la Edge Function en Supabase. Nunca colocar esta clave en variables `NEXT_PUBLIC_*`, el código del cliente ni el repositorio.

Si se necesita probar el formulario antes de producción, usar un entorno aislado o credenciales de prueba compatibles entre el widget y la función. No enviar pruebas contra la función activa de producción desde una vista previa.

## Orden de despliegue

1. Revisar y fusionar la migración `20261020000000_invitation_request_rate_limit.sql` en la ventana aprobada. Crea un registro privado de huellas HMAC para limitar las solicitudes a 8 por IP cada 10 minutos; no guarda las IP en claro.
2. Configurar `TURNSTILE_SECRET_KEY` en Supabase.
3. Desplegar `prepare-invitation-request-cover` y `cleanup-expired-events` desde el código revisado. La función de carga exige un token Turnstile verificado en servidor y usa el límite persistente.
4. Configurar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` en Vercel y desplegar la página. No promover a producción hasta probar el flujo completo.

La limpieza de portadas de solicitud usa el cron existente de `cleanup-expired-events` y elimina archivos en `event-covers/solicitudes/` con más de 90 días. Los eventos y sus reglas de limpieza actuales se conservan.

## Pruebas antes de producción

- Confirmar que cada uno de los seis tipos de evento muestra los colores originales y dos paletas propias; verificar que el resumen de WhatsApp incluye el nombre de la paleta.
- Confirmar que las fechas del evento y de límite de confirmación rechazan fechas pasadas, y que la fecha límite no excede la fecha del evento.
- Completar Turnstile y verificar que la carga de una imagen JPG, PNG o WebP vertical funciona; comprobar rechazo de imágenes horizontales, formatos no admitidos y archivos mayores de 10 MB.
- Verificar que un token Turnstile ausente, inválido, vencido o duplicado se rechaza desde la función y que los envíos excedentes reciben HTTP 429.
- Abrir la URL de la imagen en una ventana privada y confirmar que el mensaje de WhatsApp tiene ese enlace, no solicita adjuntar la foto de nuevo y requiere que el usuario pulse Enviar.
- Ejecutar una llamada autorizada a `cleanup-expired-events` con `dry_run: true` y confirmar el conteo de fotos antiguas antes de permitir una eliminación real.

No se considera validado el recorrido completo hasta ejecutar esas pruebas contra un entorno con variables de Turnstile configuradas.