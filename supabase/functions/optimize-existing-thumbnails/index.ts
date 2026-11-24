import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ImageMagick,
  MagickFormat,
  initializeImageMagick,
} from "npm:@imagemagick/magick-wasm@0.0.30";

const FUNCTION_NAME = "optimize-existing-thumbnails";
const BUCKET = "event-photos";
const BATCH_SIZE = 1;
const MAX_DIMENSION = 800;
const WEBP_QUALITY = 76;
const CACHE_CONTROL = "604800";
const VERSION_TAG = "thumb-800-q76-20261124";

// One-time capability: only the SHA-256 digest is stored in source control.
const EXPECTED_KEY_SHA256 =
  "6037ce4ecde2f79a4b79186c435a96d4a6845519be7d7494eb95a4c1cbc53eee";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
if (!supabaseUrl) throw new Error("Falta SUPABASE_URL.");

function getServiceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.default) return parsed.default as string;
  }

  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;

  throw new Error("No fue posible obtener la secret key de Supabase.");
}

const supabaseAdmin = createClient(supabaseUrl, getServiceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const wasmBytes = await Deno.readFile(
  new URL(
    "magick.wasm",
    import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"),
  ),
);
await initializeImageMagick(wasmBytes);

async function isValidKey(key: string | null) {
  if (!key) return false;

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  const actual = Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  if (actual.length !== EXPECTED_KEY_SHA256.length) return false;

  let difference = 0;
  for (let index = 0; index < actual.length; index++) {
    difference |= actual.charCodeAt(index) ^
      EXPECTED_KEY_SHA256.charCodeAt(index);
  }
  return difference === 0;
}

function resizeToWebp(input: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      ImageMagick.read(input, (image) => {
        try {
          // Fit inside an 800x800 box without cropping or upscaling.
          if (Math.max(image.width, image.height) > MAX_DIMENSION) {
            image.resize(MAX_DIMENSION, MAX_DIMENSION);
          }

          image.quality = WEBP_QUALITY;
          image.write(MagickFormat.WebP, (output) => {
            resolve(new Uint8Array(output));
          });
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

type MigrationState = {
  offset: number;
  endOffset: number;
  limit: number;
  startedAt: string;
  key: string;
  total: number;
  processed: number;
  failed: number;
  sourceOriginalBytes: number;
  optimizedThumbnailBytes: number;
};

async function runBatch(state: MigrationState) {
  const end = Math.min(state.offset + BATCH_SIZE - 1, state.endOffset - 1);
  const { data, error } = await supabaseAdmin
    .from("photos")
    .select("id,file_path,thumbnail_path")
    .lte("uploaded_at", state.startedAt)
    .order("id", { ascending: true })
    .range(state.offset, end);

  if (error) {
    console.error("THUMBNAIL_MIGRATION_QUERY_FAILED", {
      offset: state.offset,
      message: error.message,
    });
    return;
  }

  const photos = data ?? [];
  if (photos.length === 0) {
    console.log("THUMBNAIL_MIGRATION_COMPLETE", {
      ...state,
      status: "complete",
    });
    return;
  }

  let processed = state.processed;
  let failed = state.failed;
  let sourceOriginalBytes = state.sourceOriginalBytes;
  let optimizedThumbnailBytes = state.optimizedThumbnailBytes;
  const failedIds: string[] = [];

  for (const photo of photos) {
    try {
      if (!photo.file_path || !photo.thumbnail_path) {
        throw new Error("Falta la ruta del original o de la miniatura.");
      }

      // Regenerate from the compressed original, not from the oversized
      // legacy thumbnail. The original file is never modified.
      const { data: originalBlob, error: downloadError } =
        await supabaseAdmin.storage.from(BUCKET).download(photo.file_path);

      if (downloadError || !originalBlob) {
        throw new Error(
          downloadError?.message ?? "No se pudo descargar el original.",
        );
      }

      const originalBytes = new Uint8Array(
        await originalBlob.arrayBuffer()
      );
      const optimizedBytes = await resizeToWebp(originalBytes);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(
          photo.thumbnail_path,
          new Blob([optimizedBytes], { type: "image/webp" }),
          {
            upsert: true,
            contentType: "image/webp",
            cacheControl: CACHE_CONTROL,
          },
        );

      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(photo.thumbnail_path).data.publicUrl;

      const { error: updateError } = await supabaseAdmin
        .from("photos")
        .update({
          thumbnail_url: `${publicUrl}?v=${VERSION_TAG}`,
        })
        .eq("id", photo.id);

      if (updateError) throw new Error(updateError.message);

      processed++;
      sourceOriginalBytes += originalBytes.byteLength;
      optimizedThumbnailBytes += optimizedBytes.byteLength;
    } catch (error) {
      failed++;
      failedIds.push(photo.id);
      console.error("THUMBNAIL_MIGRATION_ITEM_FAILED", {
        photoId: photo.id,
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  const nextOffset = state.offset + photos.length;
  console.log("THUMBNAIL_MIGRATION_BATCH", {
    offset: state.offset,
    nextOffset,
    batchSize: photos.length,
    processed,
    failed,
    failedIds,
    sourceOriginalBytes,
    optimizedThumbnailBytes,
  });

  if (nextOffset >= state.endOffset || photos.length < BATCH_SIZE) {
    console.log("THUMBNAIL_MIGRATION_COMPLETE", {
      total: state.total,
      processed,
      failed,
      sourceOriginalBytes,
      optimizedThumbnailBytes,
      status: "complete",
    });
    return;
  }

  // Start the next small batch in a fresh invocation so image processing
  // does not accumulate CPU or memory usage in one Edge Function request.
  await new Promise((resolve) => setTimeout(resolve, 50));
  const nextUrl = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;
  const nextBody = JSON.stringify({
    offset: nextOffset,
    endOffset: state.endOffset,
    limit: state.limit,
    startedAt: state.startedAt,
    total: state.total,
    processed,
    failed,
    sourceOriginalBytes,
    optimizedThumbnailBytes,
  });

  // Supabase applies a per-trace request limit to long self-invoking chains.
  // Respect the returned retry delay instead of losing the migration cursor.
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(nextUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-maintenance-key": state.key,
        },
        body: nextBody,
      });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(12000, retryAfter * 1000 + 1000))
        );
        continue;
      }

      if (!response.ok) {
        console.error("THUMBNAIL_MIGRATION_CONTINUATION_FAILED", {
          nextOffset,
          status: response.status,
          response: await response.text(),
        });
      }
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryMatch = message.match(/Retry after (\\d+)ms/i);

      if (/rate limit exceeded/i.test(message) && attempt < 5) {
        const retryMs = retryMatch ? Number(retryMatch[1]) : 15000;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(16000, retryMs + 1000))
        );
        continue;
      }

      console.error("THUMBNAIL_MIGRATION_CONTINUATION_FAILED", {
        nextOffset,
        attempt,
        message,
      });
      return;
    }
  }

  console.error("THUMBNAIL_MIGRATION_CONTINUATION_RETRIES_EXHAUSTED", {
    nextOffset,
  });
}

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const key = req.method === "GET"
    ? url.searchParams.get("key")
    : req.headers.get("x-maintenance-key");

  if (!(await isValidKey(key))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (req.method === "GET") {
    const requestedLimit = Number.parseInt(
      url.searchParams.get("limit") ?? "657",
      10,
    );
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, 657))
      : 657;
    const startedAt = new Date().toISOString();
    const requestedOffset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
    const requestedEndOffset = Number.parseInt(url.searchParams.get("endOffset") ?? "100", 10);

    const { count, error } = await supabaseAdmin
      .from("photos")
      .select("id", { count: "exact", head: true })
      .lte("uploaded_at", startedAt);

    if (error) {
      return Response.json(
        { error: "No se pudo contar las fotografías.", details: error.message },
        { status: 500 },
      );
    }

    const effectiveLimit = Math.min(limit, count ?? 0);
    const startOffset = Number.isFinite(requestedOffset)
      ? Math.max(0, Math.min(requestedOffset, effectiveLimit))
      : 0;
    const endOffset = Number.isFinite(requestedEndOffset)
      ? Math.max(startOffset, Math.min(requestedEndOffset, effectiveLimit))
      : effectiveLimit;

    const state: MigrationState = {
      offset: startOffset,
      endOffset,
      limit: effectiveLimit,
      startedAt,
      key: key!,
      total: Math.min(limit, count ?? 0),
      processed: startOffset,
      failed: 0,
      sourceOriginalBytes: 0,
      optimizedThumbnailBytes: 0,
    };

    if (state.limit === 0) {
      return Response.json({ status: "nothing_to_process", total: 0 });
    }

    EdgeRuntime.waitUntil(runBatch(state));
    return Response.json({
      status: "started",
      total: state.total,
      batchSize: BATCH_SIZE,
      maxDimension: MAX_DIMENSION,
      webpQuality: WEBP_QUALITY,
      originalsWillBePreserved: true,
    }, { status: 202 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const state: MigrationState = {
    offset: Number(body.offset),
    endOffset: Number(body.endOffset ?? 100),
    limit: Number(body.limit),
    startedAt: String(body.startedAt),
    key: key!,
    total: Number(body.total),
    processed: Number(body.processed),
    failed: Number(body.failed),
    sourceOriginalBytes: Number(body.sourceOriginalBytes),
    optimizedThumbnailBytes: Number(body.optimizedThumbnailBytes),
  };

  if (
    !Number.isInteger(state.offset) || state.offset < 0 ||
    !Number.isInteger(state.endOffset) || state.endOffset < state.offset ||
    !Number.isInteger(state.limit) || state.limit < 1 ||
    !Number.isFinite(Date.parse(state.startedAt))
  ) {
    return Response.json({ error: "Invalid migration cursor." }, { status: 400 });
  }

  EdgeRuntime.waitUntil(runBatch(state));
  return Response.json({ status: "batch_accepted", offset: state.offset }, {
    status: 202,
  });
});
