"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Mic,
  PenLine,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import GuestMessageDialog from "./GuestMessageDialog";
import GuestAudioMessageCard from "./GuestAudioMessageCard";

import { getMessagesByEvent } from "@/lib/messages";
import { subscribeToEventMessages } from "@/lib/realtime";
import { Message } from "@/types/message";

interface Props {
  eventId: string;
}

type MessageTab = "text" | "audio";

export default function GuestMessages({ eventId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<MessageTab>("text");

  const textCarouselRef =
    useRef<HTMLDivElement | null>(null);
  const audioCarouselRef =
    useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const result = await getMessagesByEvent(eventId, 100);
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

  const textMessages = messages.filter(
    (message) => message.message_type === "text"
  );

  const audioMessages = messages.filter(
    (message) => message.message_type === "audio"
  );

  function scrollCarousel(
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) {
    const element = ref.current;

    if (!element) return;

    const amount = Math.max(
      element.clientWidth * 0.9,
      280
    );

    element.scrollBy({
      left:
        direction === "right"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  }

  const activeMessages =
    activeTab === "text"
      ? textMessages
      : audioMessages;

  const activeCarouselRef =
    activeTab === "text"
      ? textCarouselRef
      : audioCarouselRef;

  return (
    <section className="mt-10 border-t border-[#E7DCC8] pt-8 md:mt-12 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A88249]">
              Mensajes
            </p>

            <div className="mt-1.5 flex items-center justify-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[#1F1F1F] md:text-3xl">
                De quienes compartieron este día
              </h2>

              {messages.length > 0 && (
                <span className="rounded-full bg-[#F3ECE2] px-2.5 py-1 text-[11px] font-medium tabular-nums text-[#8B8378]">
                  {messages.length}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              mt-4
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#A88249]
              bg-[#A88249]
              px-4
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-[#977640]
              hover:bg-[#977640]
              hover:shadow-md
            "
          >
            <MessageCircle size={16} />
            Dejar un mensaje
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="inline-flex rounded-full border border-[#E1D5C1] bg-[#FBF9F5] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-3.5
                py-1.5
                text-xs
                font-medium
                transition-all
                ${activeTab === "text"
                  ? "bg-white text-[#3F3A34] shadow-sm"
                  : "text-[#8B8378] hover:text-[#3F3A34]"
                }
              `}
            >
              <PenLine size={14} />
              Escritos
              <span className="text-[10px] tabular-nums text-[#A49B8F]">
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
                px-3.5
                py-1.5
                text-xs
                font-medium
                transition-all
                ${activeTab === "audio"
                  ? "bg-white text-[#3F3A34] shadow-sm"
                  : "text-[#8B8378] hover:text-[#3F3A34]"
                }
              `}
            >
              <Mic size={14} />
              Audios
              <span className="text-[10px] tabular-nums text-[#A49B8F]">
                {audioMessages.length}
              </span>
            </button>
          </div>

          {activeMessages.length > 1 && (
            <div className="hidden items-center justify-center gap-1.5 md:flex">
              <button
                type="button"
                onClick={() =>
                  scrollCarousel(
                    activeCarouselRef,
                    "left"
                  )
                }
                aria-label="Ver anteriores"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E1D5C1]
                  bg-white
                  text-[#6F665B]
                  transition
                  hover:bg-[#F8F4EE]
                "
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollCarousel(
                    activeCarouselRef,
                    "right"
                  )
                }
                aria-label="Ver siguientes"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E1D5C1]
                  bg-white
                  text-[#6F665B]
                  transition
                  hover:bg-[#F8F4EE]
                "
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-5 h-28 rounded-2xl border border-[#E7DCC8] bg-[#FDFBF8]" />
        ) : activeMessages.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#E1D5C1] bg-[#FDFBF8] px-5 py-7 text-center">
            <p className="text-sm text-[#7D7467]">
              Aún no hay {activeTab === "audio" ? "audios" : "mensajes escritos"}.
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 text-xs font-medium text-[#A88249] underline underline-offset-4 hover:text-[#977640]"
            >
              Dejar el primero
            </button>
          </div>
        ) : (
          <div
            ref={activeCarouselRef}
            className="
              mt-5
              flex
              snap-x
              snap-mandatory
              gap-3
              overflow-x-auto
              px-1
              pb-2
              items-stretch
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              md:gap-4
            "
          >
            {activeTab === "text"
              ? textMessages.map((message) => (
                  <article
                    key={message.id}
                    className="
                      min-w-[82%]
                      snap-start
                      rounded-2xl
                      min-h-[176px]
                      h-full
                      flex
                      flex-col
                      border
                      border-[#E7DCC8]
                      bg-[#FDFBF8]
                      p-5
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-md
                      sm:min-w-[46%]
                      lg:min-w-[32%]
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-[#3F3A34]">
                        {message.author_name || "Invitado"}
                      </p>

                      <Heart
                        size={14}
                        className="shrink-0 text-[#C5A36A]"
                        fill="currentColor"
                      />
                    </div>

                    <div className="mt-4 flex gap-2.5">
                      <span className="font-serif text-3xl leading-none text-[#D5BD94]">
                        “
                      </span>

                      <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                        {message.content}
                      </p>
                    </div>
                  </article>
                ))
              : audioMessages.map((message) => (
                  <div
                    key={message.id}
                    className="
                      min-w-[82%]
                      snap-start
                      min-h-[176px]
                      h-full
                      sm:min-w-[46%]
                      lg:min-w-[32%]
                    "
                  >
                    <GuestAudioMessageCard message={message} />
                  </div>
                ))}
          </div>
        )}

        {activeMessages.length > 1 && (
          <p className="mt-1 text-center text-[10px] tracking-wide text-[#A49B8F] md:hidden">
            Desliza para ver más
          </p>
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
