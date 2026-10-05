"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
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
import {
  downloadEventAudioMessagesZip,
  downloadEventMessagesPdf,
} from "@/lib/message-download";
import { Event } from "@/types/event";
import { Message } from "@/types/message";

interface Props {
  event: Event;
}

type MessageTab = "text" | "audio";
type Downloading = "pdf" | "audio" | null;

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

  async function loadMessages() {
    try {
      setLoading(true);
      setMessages(
        await getMessagesByEvent(event.id, 100)
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

  async function handleDownloadPdf() {
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
        result.count === 1
          ? "Libro de firmas descargado."
          : "Libro de firmas descargado con " +
              result.count +
              " mensajes."
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
    if (audioMessages.length === 0) {
      toast.info(
        "Este evento aún no tiene mensajes de voz."
      );
      return;
    }

    try {
      setDownloading("audio");

      const result =
        await downloadEventAudioMessagesZip(event);

      if (!result.success) {
        toast.error(
          "No se pudo completar la descarga de audios."
        );
        return;
      }

      toast.success(
        result.count === 1
          ? "Audio descargado."
          : "Audios descargados en un ZIP."
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
    <div className="space-y-6 rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] p-8 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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
            Revisa, elimina y guarda los recuerdos compartidos por los invitados.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={
              downloading !== null ||
              textMessages.length === 0
            }
            className="
              inline-flex
              h-10
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
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <FileText size={15} />
            )}
            Libro de firmas PDF
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
              h-10
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
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D9CBB3] border-t-[#6F665B]" />
            ) : (
              <Download size={15} />
            )}
            Audios ZIP
          </button>
        </div>
      </div>

      <div className="flex justify-center">
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

      {loading ? (
        <p className="text-center text-sm text-[#7D7467]">
          Cargando mensajes...
        </p>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E1D5C1] bg-white px-5 py-8 text-center">
          <p className="text-sm text-[#7D7467]">
            Esta galería aún no tiene mensajes.
          </p>
        </div>
      ) : activeMessages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E1D5C1] bg-white px-5 py-8 text-center">
          <p className="text-sm text-[#7D7467]">
            Aún no hay{" "}
            {activeTab === "audio"
              ? "audios"
              : "mensajes escritos"}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeMessages.map((message) => (
            <article
              key={message.id}
              className="
                relative
                rounded-2xl
                border
                border-[#E7DCC8]
                bg-white
                p-4
                pr-14
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

              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#A49B8F]">
                {activeTab === "audio"
                  ? "Mensaje de voz"
                  : "Mensaje escrito"}
              </p>

              {activeTab === "text" ? (
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
              ) : (
                <p className="mt-3 text-sm text-[#9A9287]">
                  Este audio no está disponible.
                </p>
              )}

              <button
                type="button"
                onClick={() => handleDelete(message)}
                disabled={
                  deletingMessageId === message.id
                }
                aria-label="Eliminar mensaje"
                className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-9
                  w-9
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
