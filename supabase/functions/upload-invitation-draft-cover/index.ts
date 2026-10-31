import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function serviceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.default) return parsed.default;
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Falta la clave de servicio de Supabase.");
  return key;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const body = await req.json();
    const token = typeof body.access_token === "string" ? body.access_token.trim() : "";
    const contentType = typeof body.content_type === "string" ? body.content_type.toLowerCase() : "";
    if (!/^[a-f0-9]{64}$/.test(token)) return json({ error: "Enlace de borrador no válido." }, 400);
    const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    if (!extensions[contentType]) return json({ error: "Usa una imagen JPG, PNG o WebP." }, 415);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey(), { auth: { persistSession: false, autoRefreshToken: false } });
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, "0")).join("");
    const { data: access, error: accessError } = await admin.from("invitation_draft_access")
      .select("draft_id")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (accessError) throw accessError;
    if (!access) return json({ error: "El enlace del borrador no es válido." }, 404);

    const { data: draft, error: draftError } = await admin.from("invitation_drafts")
      .select("id,status,payment_status,editing_enabled")
      .eq("id", access.draft_id)
      .maybeSingle();
    if (draftError) throw draftError;
    if (!draft) return json({ error: "Borrador no encontrado." }, 404);
    if (!["draft", "awaiting_payment", "editing_enabled"].includes(draft.status) || draft.payment_status === "rejected" || (draft.payment_status === "paid" && !draft.editing_enabled) || (draft.payment_status === "pending" && draft.editing_enabled)) {
      return json({ error: "La carga de portada está bloqueada para este borrador." }, 403);
    }

    const path = `draft-covers/${draft.id}/${crypto.randomUUID()}.${extensions[contentType]}`;
    const { data: signed, error: signedError } = await admin.storage.from("event-covers").createSignedUploadUrl(path, { upsert: false });
    if (signedError || !signed) throw signedError ?? new Error("No se pudo preparar la carga.");
    return json({ success: true, path, token: signed.token });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "No se pudo preparar la imagen." }, 500);
  }
});
