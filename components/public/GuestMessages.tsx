"use client";

import { Heart, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import GuestMessageDialog from "./GuestMessageDialog";

import { getMessagesByEvent } from "@/lib/messages";
import { subscribeToEventMessages } from "@/lib/realtime";
import { Message } from "@/types/message";

interface Props {
  eventId: string;
}

export default function GuestMessages({ eventId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      const result = await getMessagesByEvent(eventId);
      setMessages(result);
    } catch (error) {
      console.error(
        "No fue posible cargar los mensajes:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadMessages();

    const unsubscribe =
      subscribeToEventMessages(
        eventId,
        loadMessages
      );

    return unsubscribe;
  }, [eventId, loadMessages]);

  return (
    <section className="mt-12 border-t border-[#E7DCC8] pt-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3ECE2]">
            <Heart
              size={19}
              className="text-[#A88249]"
              fill="currentColor"
            />
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#1F1F1F]">
            Mensajes de tus invitados
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[#7D7467]">
            Comparte unas palabras o deja tu voz para crear otro recuerdo del evento.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              mt-5
              inline-flex
              h-11
              items-center
              gap-2
              rounded-full
              border
              border-[#A88249]
              bg-[#A88249]
              px-5
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-colors
              duration-200
              hover:border-[#977640]
              hover:bg-[#977640]
            "
          >
            <MessageCircle size={17} />
            Dejar un mensaje
          </button>
        </div>

        {!loading && messages.length > 0 && (
          <div className="mt-8 space-y-3">
            {messages.map((message) => (
              <article
                key={message.id}
                className="
                  rounded-2xl
                  border
                  border-[#E7DCC8]
                  bg-[#FDFBF8]
                  p-4
                  shadow-sm
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#3F3A34]">
                      {message.author_name || "Invitado"}
                    </p>

                    <p className="mt-0.5 text-xs text-[#9A9287]">
                      {message.message_type === "audio"
                        ? "Mensaje de voz"
                        : "Mensaje escrito"}
                    </p>
                  </div>

                  <Heart
                    size={15}
                    className="shrink-0 text-[#C5A36A]"
                    fill="currentColor"
                  />
                </div>

                {message.message_type === "text" ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                    {message.content}
                  </p>
                ) : message.public_url ? (
                  <div className="mt-3 rounded-xl bg-white p-2">
                    <audio
                      controls
                      preload="metadata"
                      src={message.public_url}
                      className="w-full"
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#E7DCC8] bg-white/60 px-5 py-7 text-center">
            <p className="text-sm text-[#8B8378]">
              Sé el primero en dejar un recuerdo.
            </p>
          </div>
        )}
      </div>

      <GuestMessageDialog
        eventId={eventId}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={loadMessages}
      />
    </section>
  );
}
