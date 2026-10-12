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
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysRaw) {
    try {
      const secretKeys = JSON.parse(secretKeysRaw);
      if (secretKeys.default) return secretKeys.default;
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS no contiene JSON válido.");
    }
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("No fue posible obtener la secret key de Supabase.");
  return key;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405);

  try {
    const body = await req.json();
    const eventId = typeof body.event_id === "string" ? body.event_id.trim() : "";
    const token = typeof body.organizer_token === "string" ? body.organizer_token.trim() : "";
    const fileName = typeof body.file_name === "string" ? body.file_name : "";
    const contentType = typeof body.content_type === "string" ? body.content_type.toLowerCase() : "";
    const encoded = typeof body.file_base64 === "string" ? body.file_base64 : "";

    if (!eventId || !token || !fileName || !encoded) {
      return jsonResponse({ error: "Faltan datos para subir la portada." }, 400);
    }
    const allowedTypes: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!(contentType in allowedTypes)) {
      return jsonResponse({ error: "Formato no permitido. Usa JPG, PNG o WebP." }, 415);
    }

    const base64 = encoded.replace(/^data:[^;]+;base64,/, "");
    const approximateBytes = Math.floor(base64.length * 3 / 4) -
      (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
    if (approximateBytes <= 0 || approximateBytes > 10 * 1024 * 1024) {
      return jsonResponse({ error: "La portada debe pesar máximo 10 MiB." }, 413);
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

    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const path = `${eventId}-${Date.now()}.${allowedTypes[contentType]}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("event-covers")
      .upload(path, bytes, { contentType, upsert: false });
    if (uploadError) throw new Error(`No se pudo subir la portada: ${uploadError.message}`);

    const { data } = supabaseAdmin.storage.from("event-covers").getPublicUrl(path);
    return jsonResponse({ success: true, public_url: data.publicUrl });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "No fue posible subir la portada.",
    }, 500);
  }
});
