// One-time legacy thumbnail migration completed on 2026-11-24.
// Keep this stub to prevent accidental reuse of the maintenance endpoint.
Deno.serve(() => {
  return Response.json(
    { error: "This one-time migration endpoint is disabled." },
    { status: 410 },
  );
});
