import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DeleteMessageBody = {
  event_id?: unknown;
  message_id?: unknown;
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
    const body = (await req.json()) as DeleteMessageBody;
    const eventId = typeof body.event_id === "string" ? body.event_id.trim() : "";
    const messageId = typeof body.message_id === "string" ? body.message_id.trim() : "";
    const organizerToken = typeof body.organizer_token === "string"
      ? body.organizer_token.trim()
      : "";

    if (!eventId || !messageId || !organizerToken) {
      return jsonResponse({ error: "Faltan datos para eliminar el mensaje." }, 400);
    }

    const supabaseAdmin = createClient(getRequiredEnv("SUPABASE_URL"), getServiceKey());

    const { data: message, error: messageError } = await supabaseAdmin
      .from("messages")
      .select("id,event_id,file_path")
      .eq("id", messageId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (messageError) throw new Error(`No se pudo consultar el mensaje: ${messageError.message}`);
    if (!message) return jsonResponse({ error: "El mensaje no existe en este evento." }, 404);

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("organizer_token", organizerToken)
      .maybeSingle();

    if (eventError) throw new Error(`No se pudo validar el evento: ${eventError.message}`);
    if (!event) return jsonResponse({ error: "El token no corresponde a este evento." }, 403);

    if (message.file_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("event-messages")
        .remove([message.file_path]);

      if (storageError) {
        throw new Error(`No se pudo eliminar el archivo de audio: ${storageError.message}`);
      }
    }

    const { data: deletedMessage, error: deleteError } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("id", message.id)
      .eq("event_id", eventId)
      .select("id")
      .maybeSingle();

    if (deleteError) throw new Error(`No se pudo eliminar el mensaje: ${deleteError.message}`);
    if (!deletedMessage) throw new Error("El mensaje no pudo eliminarse.");

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "No fue posible eliminar el mensaje.",
    }, 500);
  }
});
