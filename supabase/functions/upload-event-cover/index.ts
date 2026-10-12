import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw);
      if (keys.default) return keys.default;
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS no contiene JSON válido.");
    }
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("No fue posible obtener la secret key de Supabase.");
  return key;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORGANIZER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,}$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405);

  try {
    const body = await req.json();
    const eventId = typeof body.event_id === "string" ? body.event_id.trim() : "";
    const token = typeof body.organizer_token === "string" ? body.organizer_token.trim() : "";
    const contentType = typeof body.content_type === "string" ? body.content_type.trim().toLowerCase() : "";

    if (!UUID_PATTERN.test(eventId) || !ORGANIZER_TOKEN_PATTERN.test(token)) {
      return jsonResponse({ error: "Los datos para validar la portada no son válidos." }, 400);
    }

    const allowedTypes: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!(contentType in allowedTypes)) {
      return jsonResponse({ error: "Formato no permitido. Usa JPG, PNG o WebP." }, 415);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      getServiceKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("organizer_token", token)
      .maybeSingle();
    if (eventError) throw new Error("No se pudo validar el evento.");
    if (!event) return jsonResponse({ error: "El token no corresponde a este evento." }, 403);

    const path = `${eventId}-${crypto.randomUUID()}.${allowedTypes[contentType]}`;
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from("event-covers")
      .createSignedUploadUrl(path, { upsert: false });
    if (signedError || !signed) {
      throw new Error(`No se pudo preparar la carga de portada: ${signedError?.message ?? "error desconocido"}`);
    }

    return jsonResponse({ success: true, path, token: signed.token });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "No fue posible preparar la carga de portada.",
    }, 500);
  }
});
