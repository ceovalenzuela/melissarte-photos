"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Heart,
  Mic,
  PenLine,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  deleteMessage,
  getMessagesByEvent,
} from "@/lib/messages";
import {
  downloadEventAudioMessagesZip,
  downloadEventMessagesPdf,
} from "@/lib/message-download";
import { Event } from "@/types/event";
import { Message } from "@/types/message";

import GuestAudioMessageCard from "@/components/public/GuestAudioMessageCard";

interface Props {
  event: Event;
}

type MessageTab = "text" | "audio";
type Downloading = "pdf" | "audio" | null;

const MESSAGE_LIST_LIMIT = 24;

export default function AdminMessageManager({
  event,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<MessageTab>("text");
  const [downloading, setDownloading] =
    useState<Downloading>(null);

  const textCarouselRef =
    useRef<HTMLDivElement | null>(null);
  const audioCarouselRef =
    useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const result = await getMessagesByEvent(
        event.id,
        MESSAGE_LIST_LIMIT
      );

      setMessages(result);
    } catch (error) {
      console.error(error);
      toast.error(
        "No fue posible cargar los mensajes."
      );
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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

  const activeCarouselRef =
    activeTab === "text"
      ? textCarouselRef
      : audioCarouselRef;

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

  async function handleDownloadPdf() {
    if (downloading !== null) return;

    if (textMessages.length === 0) {
      toast.info(
        "Este evento aún no tiene mensajes escritos."
      );
      return;
    }

    try {
      setDownloading("pdf");

      const result =
        await downloadEventMessagesPdf(event);

      if (!result.success) {
        toast.error(
          "No se pudo generar el libro de firmas."
        );
        return;
      }

      toast.success(
        "Libro de firmas descargado."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo generar el libro de firmas."
      );
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadAudio() {
    if (downloading !== null) return;

    if (audioMessages.length === 0) {
      toast.info(
        "Este evento aún no tiene mensajes de voz."
      );
      return;
    }

    try {
      setDownloading("audio");

      const result =
        await downloadEventAudioMessagesZip(
          event
        );

      if (!result.success) {
        toast.error(
          "No se pudo completar la descarga de audios."
        );
        return;
      }

      toast.success(
        "Audios descargados en un ZIP."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo completar la descarga de audios."
      );
    } finally {
      setDownloading(null);
    }
  }

  return (
    <section className="mt-10 border-t border-[#E7DCC8] pt-8 md:mt-12 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#A88249]">
            Un espacio para compartir
          </p>

          <div className="mt-1.5 flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-[#1F1F1F] md:text-2xl">
              Palabras y recuerdos de este día
            </h2>

            {messages.length > 0 && (
              <span className="rounded-full bg-[#F3ECE2] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#8B8378]">
                {messages.length}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={
                downloading !== null ||
                textMessages.length === 0
              }
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#A88249]
                px-4
                text-xs
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-[#977640]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {downloading === "pdf" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <FileText size={14} />
              )}
              Libro de firmas
            </button>

            <button
              type="button"
              onClick={handleDownloadAudio}
              disabled={
                downloading !== null ||
                audioMessages.length === 0
              }
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[#D9CBB3]
                bg-white
                px-4
                text-xs
                font-medium
                text-[#5F574D]
                transition
                hover:bg-[#F8F4EE]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {downloading === "audio" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
              ) : (
                <Download size={14} />
              )}
              Audios ZIP
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
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
              Aún no hay{" "}
              {activeTab === "audio"
                ? "audios"
                : "mensajes escritos"}.
            </p>
          </div>
        ) : (
          <div
            ref={activeCarouselRef}
            className="
              mt-5
              flex
              items-stretch
              snap-x
              snap-mandatory
              gap-3
              overflow-x-auto
              px-1
              pb-2
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
                      relative
                      min-w-[82%]
                      h-[184px]
                      min-h-[184px]
                      flex
                      snap-start
                      flex-col
                      rounded-2xl
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
                    <div className="flex items-center justify-between gap-3 pr-8">
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

                      <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                        {message.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(message)
                      }
                      disabled={
                        deletingMessageId ===
                        message.id
                      }
                      aria-label="Eliminar mensaje"
                      className="
                        absolute
                        right-3
                        top-3
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
                      {deletingMessageId ===
                      message.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </article>
                ))
              : audioMessages.map((message) => (
                  <div
                    key={message.id}
                    className="
                      relative
                      min-w-[82%]
                      h-[184px]
                      min-h-[184px]
                      snap-start
                      sm:min-w-[46%]
                      lg:min-w-[32%]
                    "
                  >
                    <GuestAudioMessageCard
                      message={message}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(message)
                      }
                      disabled={
                        deletingMessageId ===
                        message.id
                      }
                      aria-label="Eliminar mensaje de voz"
                      className="
                        absolute
                        right-3
                        top-3
                        z-10
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
                      {deletingMessageId ===
                      message.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                ))}
          </div>
        )}

        {activeMessages.length > 1 && (
          <p className="mt-1 text-center text-[10px] tracking-wide text-[#A49B8F] md:hidden">
            Desliza para ver más
          </p>
        )}

        {!loading && messages.length > 0 && (
          <p className="mt-2 text-center text-[10px] tracking-wide text-[#A49B8F]">
            Mostrando los 24 mensajes más recientes.
          </p>
        )}
      </div>
    </section>
  );
}
