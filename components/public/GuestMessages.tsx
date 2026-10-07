"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MessageCircle,
  Mic,
  PenLine,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import GuestMessageDialog from "./GuestMessageDialog";
import GuestAudioMessageCard from "./GuestAudioMessageCard";

import {
  deleteMessage,
  getMessagesByEvent,
} from "@/lib/messages";
import {
  downloadEventAudioMessagesZip,
  downloadEventMessagesPdf,
} from "@/lib/message-download";
import { subscribeToEventMessages } from "@/lib/realtime";
import { Message } from "@/types/message";
import { Event } from "@/types/event";

interface Props {
  eventId: string;
  event?: Event;
  canDelete?: boolean;
  showComposer?: boolean;
  showDownloads?: boolean;
  organizerToken?: string;
  disabled?: boolean;
}

type MessageTab = "text" | "audio";

const MESSAGE_LIST_LIMIT = 24;

export default function GuestMessages({
  eventId,
  event,
  canDelete = false,
  showComposer = true,
  showDownloads = false,
  organizerToken,
  disabled = false,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<MessageTab>("text");
  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null);
  const [downloading, setDownloading] =
    useState<"pdf" | "audio" | null>(null);

  const textCarouselRef =
    useRef<HTMLDivElement | null>(null);
  const audioCarouselRef =
    useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const result = await getMessagesByEvent(
        eventId,
        MESSAGE_LIST_LIMIT
      );
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
      subscribeToEventMessages(eventId, {
        onInsert: (message) => {
          setMessages((current) => [
            message,
            ...current.filter(
              (item) => item.id !== message.id
            ),
          ].slice(0, MESSAGE_LIST_LIMIT));
        },
        onDelete: (messageId) => {
          setMessages((current) =>
            current.filter(
              (message) => message.id !== messageId
            )
          );
        },
      });

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

  async function handleDelete(message: Message) {
    if (!canDelete) return;

    const confirmed = confirm(
      "¿Eliminar este mensaje?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setDeletingMessageId(message.id);

      await deleteMessage(message, organizerToken, eventId);

      setMessages((current) =>
        current.filter(
          (item) => item.id !== message.id
        )
      );

      toast.success("Mensaje eliminado.");
    } catch (error) {
      console.error(error);

      const messageText =
        error instanceof Error
          ? error.message
          : String(error);

      toast.error(
        messageText || "No fue posible eliminar el mensaje."
      );
    } finally {
      setDeletingMessageId(null);
    }
  }

  async function handleDownload(
    type: "pdf" | "audio"
  ) {
    if (!event || downloading || disabled) return;

    try {
      setDownloading(type);

      const result =
        type === "pdf"
          ? await downloadEventMessagesPdf(event)
          : await downloadEventAudioMessagesZip(event);

      if (!result.success) {
        toast.error(
          type === "pdf"
            ? "No hay mensajes escritos para descargar."
            : "No hay mensajes de voz para descargar."
        );
        return;
      }

      toast.success(
        type === "pdf"
          ? "Libro de firmas generado."
          : "ZIP de mensajes de voz generado."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible preparar la descarga."
      );
    } finally {
      setDownloading(null);
    }
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
    <section className="mt-16 border-t border-[#E7DCC8] pt-12 md:mt-20 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#A88249]">
              Recuerdos compartidos
            </p>

            <div className="mt-2 flex items-center justify-center gap-2">
              <h2 className="font-[var(--font-display)] text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#1F1F1F] md:text-[2.5rem]">
                Lo que vivimos juntos
              </h2>

              {messages.length > 0 && (
                <span className="rounded-full bg-[#F3ECE2] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#8B8378]">
                  {messages.length}
                </span>
              )}
            </div>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7D7467]">
              Palabras y voces de quienes fueron parte de este momento.
            </p>
          </div>

          {showComposer && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={disabled}
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
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
                disabled:hover:border-[#A88249]
                disabled:hover:bg-[#A88249]
                disabled:hover:shadow-sm
              "
            >
              <MessageCircle size={15} />
              Dejar un recuerdo
            </button>
          )}

          {showDownloads && event && (
            <div className="mt-5 w-full max-w-2xl">
              <p className="text-xs leading-5 text-[#8B8378]">
                Conserva los mensajes que dejaron tus invitados y llévatelos contigo al terminar el evento.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={disabled || Boolean(downloading)}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#D8C7A8]
                    bg-[#F7F1E7]
                    px-4
                    py-3.5
                    text-left
                    shadow-[0_6px_20px_rgba(74,60,42,0.06)]
                    transition-all
                    hover:-translate-y-0.5
                    hover:border-[#CDB990]
                    hover:bg-[#F3EBDD]
                    hover:shadow-[0_10px_24px_rgba(74,60,42,0.08)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                    disabled:hover:border-[#D8C7A8]
                    disabled:hover:bg-[#F7F1E7]
                    disabled:hover:shadow-[0_6px_20px_rgba(74,60,42,0.06)]
                  "
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A88249] text-white shadow-sm">
                    {downloading === "pdf" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <FileText size={18} strokeWidth={1.9} />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#2F2A24]">
                      Descarga el libro de firmas
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[#746B60]">
                      Todos los mensajes escritos en un PDF.
                    </span>
                  </span>

                  <Download size={15} className="ml-auto shrink-0 text-[#8B6D3B]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("audio")}
                  disabled={disabled || Boolean(downloading)}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[#D8C7A8]
                    bg-[#F7F1E7]
                    px-4
                    py-3.5
                    text-left
                    shadow-[0_6px_20px_rgba(74,60,42,0.06)]
                    transition-all
                    hover:-translate-y-0.5
                    hover:border-[#CDB990]
                    hover:bg-[#F3EBDD]
                    hover:shadow-[0_10px_24px_rgba(74,60,42,0.08)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                    disabled:hover:border-[#D8C7A8]
                    disabled:hover:bg-[#F7F1E7]
                    disabled:hover:shadow-[0_6px_20px_rgba(74,60,42,0.06)]
                  "
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A88249] text-white shadow-sm">
                    {downloading === "audio" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Mic size={18} strokeWidth={1.9} />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#2F2A24]">
                      Descarga los mensajes de voz
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[#746B60]">
                      Todos los audios en un archivo ZIP.
                    </span>
                  </span>

                  <Download size={15} className="ml-auto shrink-0 text-[#8B6D3B]" />
                </button>
              </div>
            </div>
          )}
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

            {showComposer && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={disabled}
                className="mt-2 text-xs font-medium text-[#A88249] underline underline-offset-4 hover:text-[#977640] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dejar el primero
              </button>
            )}
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
                      shadow-[0_8px_28px_rgba(53,44,34,0.06)]
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-md
                      sm:min-w-[46%]
                      lg:min-w-[32%]
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5A36A]" />
                        <p className="truncate text-sm font-semibold text-[#3F3A34]">
                          {message.author_name || "Invitado"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {canDelete && (
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
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-[#E7DCC8]
                              bg-white
                              text-[#8B8378]
                              transition
                              hover:border-[#D8C8AE]
                              hover:bg-[#F8F4EE]
                              hover:text-[#9C625C]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2.5">
                      <span className="font-serif text-3xl leading-none text-[#D5BD94]">
                        “
                      </span>

                      <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#5C554B]">
                        {message.content}
                      </p>
                    </div>
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
                      canDelete={canDelete}
                      deleting={
                        deletingMessageId === message.id
                      }
                      onDelete={() =>
                        handleDelete(message)
                      }
                    />
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

      {showComposer && (
        <GuestMessageDialog
          eventId={eventId}
          open={open}
          onOpenChange={setOpen}
          onSubmitted={loadMessages}
        />
      )}
    </section>
  );
}
