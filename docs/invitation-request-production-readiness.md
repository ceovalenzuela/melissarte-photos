# Solicitud de invitación: lista de despliegue

Esta versión no depende de un CAPTCHA ni de un servicio antispam de terceros. Usa controles de Supabase y validaciones del formulario: origen permitido, un campo trampa invisible, tiempo mínimo de llenado, enlaces de carga firmados y un límite persistente de solicitudes.

## Orden de despliegue

1. Aplicar la migración `20261020000000_invitation_request_rate_limit.sql`. Crea una tabla privada de huellas HMAC (no IP en claro) y una función RPC que limita a 8 solicitudes por origen de red cada 10 minutos.
2. Desplegar la Edge Function `prepare-invitation-request-cover`. Valida el origen de la página, descarta el campo trampa si está rellenado, rechaza envíos demasiado rápidos, usa el límite persistente y crea enlaces de carga únicos en el bucket `event-covers`.
3. Desplegar la Edge Function `cleanup-expired-events`. La tarea programada existente incluirá también la limpieza de fotos de solicitudes de más de 90 días.
4. Fusionar este PR con *squash* para llevar a `main` un único commit de cambios y dejar que Vercel publique la página.
5. Verificar el recorrido completo una vez que los cambios estén activos.

## Comprobaciones previas y posteriores

- Confirmar que cada uno de los seis tipos de evento muestra los colores originales y dos paletas propias; verificar que el resumen de WhatsApp incluye el nombre de la paleta y sus códigos HEX.
- Confirmar que las fechas del evento y del límite para confirmar no pueden ser pasadas, y que la fecha límite no excede la fecha del evento.
- Verificar que una imagen JPG, PNG o WebP vertical se pueda subir; comprobar el rechazo de imágenes horizontales, formatos no admitidos y archivos mayores de 10 MB.
- Confirmar que la carga solo funciona con solicitudes desde los orígenes autorizados y que el servidor rechaza el campo trampa rellenado y los envíos más rápidos que el tiempo mínimo.
- Enviar varias solicitudes de prueba y confirmar que, una vez alcanzado el límite, la función responda HTTP 429.
- Abrir el enlace público de la imagen en una ventana privada y confirmar que WhatsApp recibe ese enlace y no pide volver a adjuntar la foto; el cliente aún debe pulsar Enviar dentro de WhatsApp.
- Revisar la respuesta de la tarea de limpieza. Debe mostrar cuántas portadas antiguas eliminaría en modo `dry_run: true` antes de una ejecución manual de simulación. La ejecución programada normal elimina portadas que superan los 90 días.

## Alcance de la protección antispam

Estos controles reducen envíos automatizados sencillos y limitan la frecuencia de solicitudes. No equivalen a un CAPTCHA frente a un bot adaptativo: sin un proveedor externo o autenticación, un atacante decidido puede imitar tiempos y omitir un campo trampa. El límite en Supabase y los enlaces de carga firmados son los controles principales; la validación de origen es una capa adicional, no una autenticación por sí sola.
