"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Mic,
  PenLine,
  Sparkles,
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
      element.clientWidth * 0.88,
      300
    );

    element.scrollBy({
      left: direction === "right"
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
    <section className="relative mt-14 overflow-hidden">
      <div
        className="
          absolute
          -right-20
          top-8
          h-48
          w-48
          rounded-full
          bg-[#E8D4AD]/20
          blur-3xl
        "
        aria-hidden="true"
      />

      <div
        className="
          absolute
          -left-24
          bottom-0
          h-40
          w-40
          rounded-full
          bg-[#F0E3CB]/35
          blur-3xl
        "
        aria-hidden="true"
      />

      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          border
          border-[#E7DCC8]
          bg-gradient-to-br
          from-[#FBF7F0]
          via-[#FDFBF8]
          to-[#F7F1E7]
          px-4
          py-8
          shadow-sm
          md:px-7
          md:py-10
        "
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A88249] text-white shadow-md">
              <Heart
                size={22}
                fill="currentColor"
                strokeWidth={1.8}
              />

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#A88249]
                  shadow-sm
                "
              >
                <Sparkles size={13} fill="currentColor" />
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#A88249]">
              Un recuerdo más para guardar
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1F1F1F] md:text-3xl">
              Mensajes de tus invitados
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7D7467] md:text-base">
              Fotos que capturan el momento, palabras que cuentan lo que sintieron y voces que podrás volver a escuchar.
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
                bg-[#A88249]
                px-5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#977640]
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              <MessageCircle size={17} />
              Dejar un mensaje
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-full border border-[#E1D5C1] bg-white/80 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  ${activeTab === "text"
                    ? "bg-[#F3ECE2] text-[#3F3A34] shadow-sm"
                    : "text-[#8B8378] hover:text-[#3F3A34]"
                  }
                `}
              >
                <PenLine size={15} />
                Escritos
                <span className="text-xs text-[#A49B8F]">
                  {textMessages.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audio")}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  ${activeTab === "audio"
                    ? "bg-[#F3ECE2] text-[#3F3A34] shadow-sm"
                    : "text-[#8B8378] hover:text-[#3F3A34]"
                  }
                `}
              >
                <Mic size={15} />
                Audios
                <span className="text-xs text-[#A49B8F]">
                  {audioMessages.length}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-7 rounded-3xl border border-[#E7DCC8] bg-white/70 px-5 py-10 text-center text-sm text-[#8B8378]">
              Cargando mensajes...
            </div>
          ) : activeMessages.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-dashed border-[#E1D5C1] bg-white/60 px-5 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F3ECE2] text-[#A88249]">
                {activeTab === "audio" ? (
                  <Mic size={18} />
                ) : (
                  <PenLine size={18} />
                )}
              </div>

              <p className="mt-3 text-sm font-medium text-[#5C554B]">
                {activeTab === "audio"
                  ? "Aún no hay mensajes de voz."
                  : "Aún no hay mensajes escritos."}
              </p>

              <p className="mt-1 text-xs text-[#8B8378]">
                Puedes ser el primero en dejar un recuerdo.
              </p>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-4 text-sm font-medium text-[#A88249] underline underline-offset-4 hover:text-[#977640]"
              >
                Dejar un mensaje
              </button>
            </div>
          ) : (
            <div className="relative mt-7">
              {activeMessages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      scrollCarousel(
                        activeCarouselRef,
                        "left"
                      )
                    }
                    aria-label={
                      activeTab === "audio"
                        ? "Ver audios anteriores"
                        : "Ver mensajes anteriores"
                    }
                    className="
                      absolute
                      -left-1
                      top-1/2
                      z-10
                      hidden
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#E1D5C1]
                      bg-white/95
                      text-[#5F574D]
                      shadow-md
                      transition-all
                      hover:scale-105
                      hover:bg-white
                      md:flex
                    "
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollCarousel(
                        activeCarouselRef,
                        "right"
                      )
                    }
                    aria-label={
                      activeTab === "audio"
                        ? "Ver audios siguientes"
                        : "Ver mensajes siguientes"
                    }
                    className="
                      absolute
                      -right-1
                      top-1/2
                      z-10
                      hidden
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#E1D5C1]
                      bg-white/95
                      text-[#5F574D]
                      shadow-md
                      transition-all
                      hover:scale-105
                      hover:bg-white
                      md:flex
                    "
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div
                ref={activeCarouselRef}
                className="
                  flex
                  snap-x
                  snap-mandatory
                  gap-3
                  overflow-x-auto
                  px-1
                  pb-3
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                  md:gap-4
                  md:px-8
                "
              >
                {activeTab === "text"
                  ? textMessages.map((message) => (
                      <article
                        key={message.id}
                        className="
                          min-w-[88%]
                          snap-start
                          rounded-3xl
                          border
                          border-[#E7DCC8]
                          bg-white
                          p-5
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:shadow-md
                          md:min-w-[48%]
                          lg:min-w-[31.5%]
                        "
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#3F3A34]">
                              {message.author_name || "Invitado"}
                            </p>

                            <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[#A88249]">
                              Mensaje
                            </p>
                          </div>

                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3ECE2] text-[#A88249]">
                            <Heart
                              size={14}
                              fill="currentColor"
                            />
                          </span>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <span className="mt-1 text-3xl font-serif leading-none text-[#D5BD94]">
                            “
                          </span>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                            {message.content}
                          </p>
                        </div>
                      </article>
                    ))
                  : audioMessages.map((message) => (
                      <div
                        key={message.id}
                        className="
                          min-w-[88%]
                          snap-start
                          md:min-w-[48%]
                          lg:min-w-[31.5%]
                        "
                      >
                        <GuestAudioMessageCard
                          message={message}
                        />
                      </div>
                    ))}
              </div>

              <div className="mt-1 text-center">
                <p className="text-[11px] text-[#9A9287]">
                  Desliza para ver más recuerdos
                </p>
              </div>
            </div>
          )}
        </div>
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
