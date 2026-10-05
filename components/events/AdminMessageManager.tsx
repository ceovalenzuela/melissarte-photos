"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteMessage,
  getMessagesByEvent,
} from "@/lib/messages";
import { Message } from "@/types/message";

interface Props {
  eventId: string;
}

export default function AdminMessageManager({
  eventId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null);

  async function loadMessages() {
    try {
      setLoading(true);
      setMessages(await getMessagesByEvent(eventId, 100));
    } catch (error) {
      console.error(error);
      toast.error("No fue posible cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [eventId]);

  async function handleDelete(message: Message) {
    const confirmed = confirm(
      "¿Eliminar este mensaje?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setDeletingMessageId(message.id);
      await deleteMessage(message);

      setMessages((current) =>
        current.filter((item) => item.id !== message.id)
      );

      toast.success("Mensaje eliminado.");
    } catch (error) {
      console.error(error);
      toast.error("No fue posible eliminar el mensaje.");
    } finally {
      setDeletingMessageId(null);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-[#1F1F1F]">
          Mensajes
        </h2>

        <p className="mt-2 text-sm text-[#7D7467]">
          Revisa y elimina los mensajes compartidos por los invitados.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#7D7467]">
          Cargando mensajes...
        </p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-[#7D7467]">
          Esta galería aún no tiene mensajes.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className="relative rounded-2xl border border-[#E7DCC8] bg-white p-4 pr-14"
            >
              <p className="text-sm font-semibold text-[#3F3A34]">
                {message.author_name || "Invitado"}
              </p>

              <p className="mt-0.5 text-xs text-[#9A9287]">
                {message.message_type === "audio"
                  ? "Mensaje de voz"
                  : "Mensaje escrito"}
              </p>

              {message.message_type === "text" ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                  {message.content}
                </p>
              ) : message.public_url ? (
                <audio
                  controls
                  preload="metadata"
                  src={message.public_url}
                  className="mt-3 w-full"
                />
              ) : null}

              <button
                type="button"
                onClick={() => handleDelete(message)}
                disabled={deletingMessageId === message.id}
                aria-label="Eliminar mensaje"
                className="
                  absolute right-3 top-3
                  flex h-9 w-9 items-center justify-center
                  rounded-full bg-black/5 text-[#6F665B]
                  transition-colors hover:bg-red-50 hover:text-red-600
                  disabled:cursor-wait disabled:opacity-60
                "
              >
                {deletingMessageId === message.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </article>
          ))}
        </div>
      )}

      {!loading && messages.length > 0 && (
        <p className="text-center text-xs text-[#7D7467]">
          Mostrando hasta 100 mensajes más recientes.
        </p>
      )}
    </div>
  );
}
