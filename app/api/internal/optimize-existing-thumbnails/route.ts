// TEMPORARY: remove after the one-time legacy thumbnail migration is verified.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FUNCTION_URL =
  "https://frnmkhffpbykbtvhpkxq.supabase.co/functions/v1/optimize-existing-thumbnails";

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const key = incoming.searchParams.get("key");
  const limit = incoming.searchParams.get("limit") ?? "657";

  if (!key || !/^(1|657)$/.test(limit)) {
    return Response.json({ error: "Unauthorized or invalid limit." }, { status: 401 });
  }

  const target = new URL(FUNCTION_URL);
  target.searchParams.set("key", key);
  target.searchParams.set("limit", limit);

  try {
    const response = await fetch(target, {
      method: "GET",
      cache: "no-store",
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return Response.json(
      { error: "No fue posible iniciar la migración de miniaturas." },
      { status: 502 },
    );
  }
}
