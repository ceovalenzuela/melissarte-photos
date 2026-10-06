import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_EVENTS_PER_RUN = 50;
const STORAGE_BATCH_SIZE = 1000;

type ExpiredEvent = {
  id: string;
  title: string;
  event_date: string;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

function assertCronSecret(req: Request) {
  const expectedSecret = getRequiredEnv("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");

  if (!providedSecret || providedSecret !== expectedSecret) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

async function removeStorageObjects(
  supabaseAdmin: ReturnType<typeof createClient>,
  bucket: string,
  paths: string[]
) {
  const uniquePaths = [...new Set(paths)].filter(Boolean);

  for (
    let index = 0;
    index < uniquePaths.length;
    index += STORAGE_BATCH_SIZE
  ) {
    const batch = uniquePaths.slice(
      index,
      index + STORAGE_BATCH_SIZE
    );

    if (batch.length === 0) continue;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(batch);

    if (error) {
      throw new Error(
        `No se pudieron eliminar objetos de Storage en ${bucket}: ${error.message}`
      );
    }
  }
}

async function getEventPhotoPaths(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventId: string
) {
  const paths: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("photos")
      .select("file_path,thumbnail_path")
      .eq("event_id", eventId)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(
        `No se pudieron consultar las fotografías: ${error.message}`
      );
    }

    for (const photo of data ?? []) {
      if (photo.file_path) paths.push(photo.file_path);
      if (photo.thumbnail_path) {
        paths.push(photo.thumbnail_path);
      }
    }

    if ((data ?? []).length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return paths;
}

async function getEventAudioPaths(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventId: string
) {
  const paths: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("file_path")
      .eq("event_id", eventId)
      .eq("message_type", "audio")
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(
        `No se pudieron consultar los audios: ${error.message}`
      );
    }

    for (const message of data ?? []) {
      if (message.file_path) {
        paths.push(message.file_path);
      }
    }

    if ((data ?? []).length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return paths;
}

async function getEventCoverPaths(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventId: string
) {
  const paths: string[] = [];
  const search = eventId;

  const { data, error } = await supabaseAdmin.storage
    .from("event-covers")
    .list("", {
      limit: 1000,
      search,
    });

  if (error) {
    throw new Error(
      `No se pudieron consultar las portadas: ${error.message}`
    );
  }

  const prefix = `${eventId}-`;

  for (const object of data ?? []) {
    if (object.name.startsWith(prefix)) {
      paths.push(object.name);
    }
  }

  return paths;
}

async function cleanupEvent(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: ExpiredEvent
) {
  const [photoPaths, audioPaths, coverPaths] =
    await Promise.all([
      getEventPhotoPaths(supabaseAdmin, event.id),
      getEventAudioPaths(supabaseAdmin, event.id),
      getEventCoverPaths(supabaseAdmin, event.id),
    ]);

  await removeStorageObjects(
    supabaseAdmin,
    "event-photos",
    photoPaths
  );

  await removeStorageObjects(
    supabaseAdmin,
    "event-messages",
    audioPaths
  );

  await removeStorageObjects(
    supabaseAdmin,
    "event-covers",
    coverPaths
  );

  const { error: photosDeleteError } =
    await supabaseAdmin
      .from("photos")
      .delete()
      .eq("event_id", event.id);

  if (photosDeleteError) {
    throw new Error(
      `No se pudieron eliminar las fotografías de la base de datos: ${photosDeleteError.message}`
    );
  }

  const { error: messagesDeleteError } =
    await supabaseAdmin
      .from("messages")
      .delete()
      .eq("event_id", event.id);

  if (messagesDeleteError) {
    throw new Error(
      `No se pudieron eliminar los mensajes de la base de datos: ${messagesDeleteError.message}`
    );
  }

  const { error: purgeMarkError } =
    await supabaseAdmin
      .from("events")
      .update({
        status: "draft",
        content_purged_at: new Date().toISOString(),
      })
      .eq("id", event.id);

  if (purgeMarkError) {
    throw new Error(
      `No se pudo marcar el contenido del evento como purgado: ${purgeMarkError.message}`
    );
  }

  return {
    photos: photoPaths.length,
    audios: audioPaths.length,
    covers: coverPaths.length,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    assertCronSecret(req);

    let dryRun = false;
    let requestedEventId: string | null = null;

    try {
      const body = await req.json();
      dryRun = body?.dry_run === true;

      if (
        typeof body?.event_id === "string" &&
        body.event_id.trim()
      ) {
        requestedEventId = body.event_id.trim();
      }
    } catch {
      // Empty request body is valid for the scheduled job.
    }

    const secretKeysRaw = Deno.env.get(
      "SUPABASE_SECRET_KEYS"
    );

    const secretKeys = secretKeysRaw
      ? JSON.parse(secretKeysRaw)
      : {};

    const serviceKey =
      secretKeys.default ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceKey) {
      throw new Error(
        "No fue posible obtener la secret key de Supabase."
      );
    }

    const supabaseAdmin = createClient(
      getRequiredEnv("SUPABASE_URL"),
      serviceKey
    );

    const cutoff = new Date();
    cutoff.setUTCDate(
      cutoff.getUTCDate() - 30
    );

    const cutoffDate = cutoff
      .toISOString()
      .slice(0, 10);

    const { data: events, error } = await supabaseAdmin
      .from("events")
      .select("id,title,event_date")
      .lte("event_date", cutoffDate)
      .is("content_purged_at", null)
      .order("event_date", {
        ascending: true,
      })
      .limit(MAX_EVENTS_PER_RUN);

    if (requestedEventId) {
      const selectedEvent = (events ?? []).find(
        (event) => event.id === requestedEventId
      );

      if (!selectedEvent) {
        return Response.json(
          {
            cutoff_date: cutoffDate,
            found: 0,
            deleted: 0,
            failed: 0,
            dry_run: dryRun,
            requested_event_id: requestedEventId,
            details: [],
            message:
              "El evento solicitado no existe, ya fue purgado o todavía no cumple los 30 días.",
          },
          { status: 200 }
        );
      }

      events = [selectedEvent];
    }

    if (error) {
      throw new Error(
        `No se pudieron consultar los eventos vencidos: ${error.message}`
      );
    }

    const results = {
      cutoff_date: cutoffDate,
      found: events?.length ?? 0,
      deleted: 0,
      failed: 0,
      details: [] as Array<Record<string, unknown>>,
      dry_run: dryRun,
      requested_event_id: requestedEventId,
    };

    for (const event of (events ?? []) as ExpiredEvent[]) {
      try {
        if (dryRun) {
          results.details.push({
            event_id: event.id,
            title: event.title,
            event_date: event.event_date,
            status: "would_delete",
          });
          continue;
        }

        const counts = await cleanupEvent(
          supabaseAdmin,
          event
        );

        results.deleted += 1;
        results.details.push({
          event_id: event.id,
          title: event.title,
          event_date: event.event_date,
          ...counts,
          status: "deleted",
        });
      } catch (error) {
        results.failed += 1;
        results.details.push({
          event_id: event.id,
          title: event.title,
          event_date: event.event_date,
          status: "failed",
          error:
            error instanceof Error
              ? error.message
              : "Error desconocido",
        });

        console.error(
          "No se pudo limpiar el evento:",
          event.id,
          error
        );
      }
    }

    return Response.json(results);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error(
      "Error general en cleanup-expired-events:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      { status: 500 }
    );
  }
});
