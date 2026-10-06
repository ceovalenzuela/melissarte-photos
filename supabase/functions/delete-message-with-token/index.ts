import { createClient } from "npm:@supabase/supabase-js@2";

type DeleteMessageBody = {
  message_id?: unknown;
  organizer_token?: unknown;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }

  return value;
}

function getServiceKey() {
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (secretKeysRaw) {
    try {
      const secretKeys = JSON.parse(secretKeysRaw);

      if (secretKeys.default) {
        return secretKeys.default;
      }
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS no contiene JSON válido.");
    }
  }

  const serviceKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  if (!serviceKey) {
    throw new Error(
      "No fue posible obtener la secret key de Supabase."
    );
  }

  return serviceKey;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const body = (await req.json()) as DeleteMessageBody;

    const messageId =
      typeof body.message_id === "string"
        ? body.message_id.trim()
        : "";

    const organizerToken =
      typeof body.organizer_token === "string"
        ? body.organizer_token.trim()
        : "";

    if (!messageId || !organizerToken) {
      return Response.json(
        { error: "Faltan datos para eliminar el mensaje." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      getRequiredEnv("SUPABASE_URL"),
      getServiceKey()
    );

    const { data: message, error: messageError } =
      await supabaseAdmin
        .from("messages")
        .select("id,event_id,file_path")
        .eq("id", messageId)
        .maybeSingle();

    if (messageError) {
      throw new Error(
        `No se pudo consultar el mensaje: ${messageError.message}`
      );
    }

    if (!message) {
      return Response.json(
        { error: "El mensaje no existe." },
        { status: 404 }
      );
    }

    const { data: event, error: eventError } =
      await supabaseAdmin
        .from("events")
        .select("id")
        .eq("id", message.event_id)
        .eq("organizer_token", organizerToken)
        .maybeSingle();

    if (eventError) {
      throw new Error(
        `No se pudo validar el evento: ${eventError.message}`
      );
    }

    if (!event) {
      return Response.json(
        { error: "El token no corresponde a este evento." },
        { status: 403 }
      );
    }

    if (message.file_path) {
      const { error: storageError } =
        await supabaseAdmin.storage
          .from("event-messages")
          .remove([message.file_path]);

      if (storageError) {
        throw new Error(
          `No se pudo eliminar el archivo de audio: ${storageError.message}`
        );
      }
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("messages")
        .delete()
        .eq("id", message.id)
        .eq("event_id", message.event_id);

    if (deleteError) {
      throw new Error(
        `No se pudo eliminar el mensaje: ${deleteError.message}`
      );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible eliminar el mensaje.",
      },
      { status: 500 }
    );
  }
});
