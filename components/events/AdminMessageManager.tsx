"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Mic,
  PenLine,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteMessage,
  getMessagesByEvent,
} from "@/lib/messages";
import { Event } from "@/types/event";
import { Message } from "@/types/message";

import GuestAudioMessageCard from "@/components/public/GuestAudioMessageCard";

interface Props {
  event: Event;
}

type MessageTab = "text" | "audio";

const MESSAGE_LIST_LIMIT = 100;

export default function AdminMessageManager({
  event,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<MessageTab>("text");

  async function loadMessages() {
    try {
      setLoading(true);

      setMessages(
        await getMessagesByEvent(
          event.id,
          MESSAGE_LIST_LIMIT
        )
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible cargar los mensajes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [event.id]);

  const textMessages = messages.filter(
    (message) =>
      message.message_type === "text"
  );

  const audioMessages = messages.filter(
    (message) =>
      message.message_type === "audio"
  );

  const activeMessages =
    activeTab === "text"
      ? textMessages
      : audioMessages;

  async function handleDelete(message: Message) {
    const confirmed = confirm(
      "¿Eliminar este mensaje?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setDeletingMessageId(message.id);

      await deleteMessage(message);

      setMessages((current) =>
        current.filter(
          (item) => item.id !== message.id
        )
      );

      toast.success("Mensaje eliminado.");
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible eliminar el mensaje."
      );
    } finally {
      setDeletingMessageId(null);
    }
  }

  return (
    <div className="space-y-5 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Mensajes
          </h2>

          {messages.length > 0 && (
            <span className="rounded-full bg-[#F3ECE2] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#8B8378]">
              {messages.length}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-[#7D7467]">
          {messages.length === 0
            ? "Esta galería no tiene mensajes."
            : `${messages.length} ${messages.length === 1 ? "mensaje" : "mensajes"} en esta galería.`}
        </p>
      </div>

      {messages.length > 0 && (
        <div className="flex justify-center sm:justify-start">
          <div className="inline-flex rounded-full border border-[#E1D5C1] bg-[#FBF9F5] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-medium
                transition-all
                ${activeTab === "text"
                  ? "bg-white text-[#3F3A34] shadow-sm"
                  : "text-[#8B8378] hover:text-[#3F3A34]"
                }
              `}
            >
              <PenLine size={13} />
              Escritos
              <span className="text-[9px] tabular-nums text-[#A49B8F]">
                {textMessages.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audio")}
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-medium
                transition-all
                ${activeTab === "audio"
                  ? "bg-white text-[#3F3A34] shadow-sm"
                  : "text-[#8B8378] hover:text-[#3F3A34]"
                }
              `}
            >
              <Mic size={13} />
              Audios
              <span className="text-[9px] tabular-nums text-[#A49B8F]">
                {audioMessages.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#7D7467]">
          Cargando mensajes...
        </p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-[#7D7467]">
          Esta galería no tiene mensajes.
        </p>
      ) : activeMessages.length === 0 ? (
        <p className="text-sm text-[#7D7467]">
          No hay{" "}
          {activeTab === "audio"
            ? "mensajes de voz"
            : "mensajes escritos"}.
        </p>
      ) : (
        <div className="space-y-3">
          {activeMessages.map((message) =>
            message.message_type === "audio" && message.public_url ? (
              <GuestAudioMessageCard
                key={message.id}
                message={message}
                canDelete
                deleting={deletingMessageId === message.id}
                onDelete={() => handleDelete(message)}
              />
            ) : (
              <article
                key={message.id}
                className="
                  relative
                  rounded-2xl
                  border
                  border-[#E7DCC8]
                  bg-white
                  p-4
                  pr-12
                "
              >
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#3F3A34]">
                    {message.author_name || "Invitado"}
                  </p>

                  <Heart
                    size={13}
                    className="shrink-0 text-[#C5A36A]"
                    fill="currentColor"
                  />
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                  {message.content}
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(message)}
                  disabled={deletingMessageId === message.id}
                  aria-label="Eliminar mensaje"
                  className="
                    absolute
                    right-2
                    top-2
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-black/5
                    text-[#6F665B]
                    transition-colors
                    hover:bg-red-50
                    hover:text-red-600
                    disabled:cursor-wait
                    disabled:opacity-60
                  "
                >
                  {deletingMessageId === message.id ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </article>
            )
          )}
        </div>
      )}

      {!loading && messages.length > 0 && (
        <p className="text-center text-xs text-[#7D7467]">
          Mostrando hasta {MESSAGE_LIST_LIMIT} mensajes recientes.
        </p>
      )}
    </div>
  );
}
