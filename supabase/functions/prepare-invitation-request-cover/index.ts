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
  if (!origin) return false;
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

let rateLimitCleanupCounter = 0;

function checkRateLimit(key: string) {
  const now = Date.now();
  rateLimitCleanupCounter += 1;
  if (rateLimitCleanupCounter % 100 === 0) {
    for (const [storedKey, entry] of requests) {
      if (now - entry.startedAt > RATE_WINDOW_MS) requests.delete(storedKey);
    }
  }
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

async function verifyTurnstileToken(token: string, expectedHostname: string) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) throw new Error("Falta configurar TURNSTILE_SECRET_KEY.");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token }),
  });
  if (!response.ok) throw new Error("No se pudo validar la verificación de seguridad.");

  const result = await response.json() as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  return result.success === true
    && result.action === "invitation_request"
    && result.hostname === expectedHostname;
}

async function rateLimitFingerprint(req: Request, secret: string) {
  const clientIp = req.headers.get("cf-connecting-ip")?.trim()
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!clientIp) throw new Error("No fue posible determinar el origen de la solicitud.");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(clientIp));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
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

    const turnstileToken = typeof body?.turnstile_token === "string" ? body.turnstile_token.trim() : "";
    const turnstileRequired = Deno.env.get("TURNSTILE_REQUIRE_TOKEN") !== "false";
    if (!origin) {
      return jsonResponse({ error: "Origen no permitido." }, 403, origin);
    }
    if (!turnstileToken && turnstileRequired) {
      return jsonResponse({ error: "Completa la verificación de seguridad para continuar." }, 400, origin);
    }
    if (turnstileToken) {
      const expectedHostname = new URL(origin).hostname;
      const turnstileValid = await verifyTurnstileToken(turnstileToken, expectedHostname);
      if (!turnstileValid) {
        return jsonResponse({ error: "La verificación de seguridad no fue válida. Inténtalo de nuevo." }, 403, origin);
      }
    }

    const serviceKey = getServiceKey();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const fingerprint = await rateLimitFingerprint(req, serviceKey);
    const { data: requestAllowed, error: rateLimitError } = await supabaseAdmin.rpc(
      "consume_invitation_request_rate_limit",
      { p_fingerprint: fingerprint, p_max_requests: 8, p_window_seconds: 600 },
    );
    if (rateLimitError) {
      console.error("No fue posible comprobar el límite de solicitudes:", rateLimitError.message);
      throw new Error("No fue posible comprobar el límite de solicitudes.");
    }
    if (requestAllowed !== true) {
      return jsonResponse({ error: "Has enviado varias solicitudes recientemente. Espera unos minutos y vuelve a intentarlo." }, 429, origin);
    }

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
