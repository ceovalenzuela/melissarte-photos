import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/fotos\.melissartedecorativo\.com$/,
  /^https:\/\/(?:www\.)?melissartedecorativo\.com$/,
  /^https:\/\/[a-z0-9-]*melissarte-photos[a-z0-9-]*\.vercel\.app$/,
  /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/,
];
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const requests = new Map<string, { count: number; startedAt: number }>();

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
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

function rateLimitKey(req: Request) {
  return req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = requests.get(key);
  if (!current || now - current.startedAt > RATE_WINDOW_MS) {
    requests.set(key, { count: 1, startedAt: now });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  requests.set(key, current);
  return true;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return new Response("Origen no permitido.", { status: 403 });
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405, origin);
  if (!isAllowedOrigin(origin)) return jsonResponse({ error: "Origen no permitido." }, 403, origin);
  if (!checkRateLimit(rateLimitKey(req))) {
    return jsonResponse({ error: "Has realizado varias solicitudes. Espera unos minutos y vuelve a intentarlo." }, 429, origin);
  }

  try {
    const body = await req.json();
    const contentType = typeof body?.content_type === "string" ? body.content_type.trim().toLowerCase() : "";
    const extension = ALLOWED_TYPES[contentType];
    if (!extension) return jsonResponse({ error: "Formato no permitido. Usa JPG, PNG o WebP." }, 415, origin);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      getServiceKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const path = "solicitudes/" + crypto.randomUUID() + "." + extension;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("event-covers")
      .createSignedUploadUrl(path, { upsert: false });
    if (error || !signed) {
      throw new Error("No se pudo preparar la carga de la foto.");
    }

    return jsonResponse({
      success: true,
      path,
      token: signed.token,
    }, 200, origin);
  } catch (error) {
    console.error("Error preparando carga de solicitud:", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "No fue posible preparar la carga de la foto.",
    }, 500, origin);
  }
});
