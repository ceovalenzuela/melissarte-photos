import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DeletePhotoBody = {
  event_id?: unknown;
  photo_id?: unknown;
  organizer_token?: unknown;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
  return value;
}

function getServiceKey() {
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysRaw) {
    try {
      const secretKeys = JSON.parse(secretKeysRaw);
      if (secretKeys.default) return secretKeys.default;
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS no contiene JSON válido.");
    }
  }
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) throw new Error("No fue posible obtener la secret key de Supabase.");
  return serviceKey;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405);
  }

  try {
    const body = (await req.json()) as DeletePhotoBody;
    const eventId = typeof body.event_id === "string" ? body.event_id.trim() : "";
    const photoId = typeof body.photo_id === "string" ? body.photo_id.trim() : "";
    const organizerToken = typeof body.organizer_token === "string"
      ? body.organizer_token.trim()
      : "";

    if (!eventId || !photoId || !organizerToken) {
      return jsonResponse({ error: "Faltan datos para eliminar la fotografía." }, 400);
    }

    const supabaseAdmin = createClient(getRequiredEnv("SUPABASE_URL"), getServiceKey());

    const { data: photo, error: photoError } = await supabaseAdmin
      .from("photos")
      .select("id,event_id,file_path,thumbnail_path")
      .eq("id", photoId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (photoError) throw new Error(`No se pudo consultar la fotografía: ${photoError.message}`);
    if (!photo) return jsonResponse({ error: "La fotografía no existe en este evento." }, 404);

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("organizer_token", organizerToken)
      .maybeSingle();

    if (eventError) throw new Error(`No se pudo validar el evento: ${eventError.message}`);
    if (!event) return jsonResponse({ error: "El token no corresponde a este evento." }, 403);

    const paths = [photo.file_path, photo.thumbnail_path].filter(
      (path): path is string => typeof path === "string" && path.length > 0,
    );
    if (paths.length !== 2) {
      throw new Error("La fotografía no tiene las rutas de archivo esperadas.");
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("event-photos")
      .remove(paths);

    if (storageError) {
      throw new Error(`No se pudieron eliminar los archivos de la fotografía: ${storageError.message}`);
    }

    const { data: deletedPhoto, error: deleteError } = await supabaseAdmin
      .from("photos")
      .delete()
      .eq("id", photo.id)
      .eq("event_id", eventId)
      .select("id")
      .maybeSingle();

    if (deleteError) throw new Error(`No se pudo eliminar el registro de la fotografía: ${deleteError.message}`);
    if (!deletedPhoto) throw new Error("La fotografía no pudo eliminarse de la galería.");

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "No fue posible eliminar la fotografía.",
    }, 500);
  }
});
