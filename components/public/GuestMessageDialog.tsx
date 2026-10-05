"use client";

import {
  ArrowLeft,
  Check,
  Mic,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createAudioMessage,
  createTextMessage,
} from "@/lib/messages";

type MessageMode = "choice" | "text" | "audio";

interface Props {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export default function GuestMessageDialog({
  eventId,
  open,
  onOpenChange,
  onSubmitted,
}: Props) {
  const [mode, setMode] = useState<MessageMode>("choice");
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  function clearAudioPreview() {
    setAudioBlob(null);
    setRecordingSeconds(0);

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = "";
    }

    setAudioUrl("");
  }

  function stopStreams() {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    stopStreams();
    setRecording(false);
  }

  async function startRecording() {
    if (recording || saving) return;

    if (!("MediaRecorder" in window)) {
      toast.error(
        "Tu navegador no permite grabar audio. Puedes dejar un mensaje escrito."
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        "Tu navegador no permite acceder al micrófono."
      );
      return;
    }

    try {
      clearAudioPreview();

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];

      const supportedMimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 24000,
      };

      if (supportedMimeType) {
        recorderOptions.mimeType = supportedMimeType;
      }

      const recorder = new MediaRecorder(
        stream,
        recorderOptions
      );

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        setAudioBlob(blob);

        const nextUrl = URL.createObjectURL(blob);
        audioUrlRef.current = nextUrl;
        setAudioUrl(nextUrl);

        setRecording(false);
        stopStreams();
        recorderRef.current = null;
      };

      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((current) => {
          const next = current + 1;

          if (next >= 60) {
            window.clearInterval(timerRef.current!);
            timerRef.current = null;

            if (recorderRef.current?.state === "recording") {
              recorderRef.current.stop();
            }
          }

          return next;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      stopStreams();

      toast.error(
        "No pudimos acceder al micrófono. Revisa el permiso e intenta nuevamente."
      );
    }
  }

  function resetDialogState() {
    stopRecording();
    setMode("choice");
    setText("");
    clearAudioPreview();
    setSaving(false);
  }

  function handleDialogChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialogState();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    const name = authorName.trim() || "Invitado";

    try {
      setSaving(true);

      if (mode === "text") {
        await createTextMessage(
          eventId,
          name,
          text
        );
      } else if (mode === "audio" && audioBlob) {
        await createAudioMessage(
          eventId,
          name,
          audioBlob,
          recordingSeconds
        );
      } else {
        return;
      }

      toast.success("Tu recuerdo fue compartido 💛");
      onSubmitted?.();
      handleDialogChange(false);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible compartir tu mensaje."
      );
    } finally {
      setSaving(false);
    }
  }

  const canSubmitText =
    text.trim().length > 0 && !saving;

  const canSubmitAudio =
    Boolean(audioBlob) && !recording && !saving;

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent
        className="
          max-w-md
          rounded-3xl
          border
          border-[#E7DCC8]
          bg-[#FDFBF8]
          p-0
        "
      >
        <DialogHeader className="border-b border-[#E7DCC8] px-6 py-6">
          <div className="flex items-center gap-3">
            {mode !== "choice" && (
              <button
                type="button"
                onClick={() => {
                  stopRecording();
                  clearAudioPreview();
                  setMode("choice");
                }}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E7DCC8]
                  bg-white
                  text-[#6F665B]
                  transition-colors
                  hover:bg-[#F7F3EC]
                "
                aria-label="Volver"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div>
              <DialogTitle className="text-xl font-semibold text-[#1F1F1F]">
                {mode === "choice"
                  ? "Deja un recuerdo 💌"
                  : mode === "text"
                    ? "Escribe un mensaje"
                    : "Deja un mensaje de voz"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-[#7D7467]">
                {mode === "choice"
                  ? "Comparte unas palabras o deja tu voz para los anfitriones."
                  : mode === "text"
                    ? "Un recuerdo que podrán conservar después del evento."
                    : "Habla con calma. Tu mensaje puede durar hasta 1 minuto."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {mode === "choice" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5C554B]">
                  Tu nombre
                  <span className="ml-1 font-normal text-[#9A9287]">
                    (opcional)
                  </span>
                </label>

                <input
                  value={authorName}
                  onChange={(event) =>
                    setAuthorName(event.target.value)
                  }
                  maxLength={80}
                  placeholder="¿Cómo te llamas?"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#E7DCC8]
                    bg-white
                    px-4
                    py-3
                    text-[#1F1F1F]
                    outline-none
                    transition-colors
                    focus:border-[#A88249]
                  "
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className="
                    flex
                    flex-col
                    items-center
                    rounded-2xl
                    border
                    border-[#E7DCC8]
                    bg-white
                    px-5
                    py-6
                    text-center
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#FAF6EF]
                    hover:shadow-sm
                  "
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3ECE2] text-xl">
                    ✍️
                  </span>
                  <span className="font-medium text-[#3F3A34]">
                    Escrito
                  </span>
                  <span className="mt-1 text-xs text-[#8B8378]">
                    Deja unas palabras
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("audio")}
                  className="
                    flex
                    flex-col
                    items-center
                    rounded-2xl
                    border
                    border-[#E7DCC8]
                    bg-white
                    px-5
                    py-6
                    text-center
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#FAF6EF]
                    hover:shadow-sm
                  "
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3ECE2]">
                    <Mic
                      size={22}
                      className="text-[#A88249]"
                    />
                  </span>
                  <span className="font-medium text-[#3F3A34]">
                    Audio
                  </span>
                  <span className="mt-1 text-xs text-[#8B8378]">
                    Deja tu voz
                  </span>
                </button>
              </div>
            </>
          )}

          {mode === "text" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5C554B]">
                  Tu mensaje
                </label>

                <textarea
                  value={text}
                  onChange={(event) =>
                    setText(event.target.value)
                  }
                  maxLength={180}
                  rows={6}
                  autoFocus
                  placeholder="Escribe algo bonito para los anfitriones..."
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[#E7DCC8]
                    bg-white
                    p-4
                    text-[#1F1F1F]
                    outline-none
                    transition-colors
                    focus:border-[#A88249]
                  "
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-[#8B8378]">
                    {text.length} / 300
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canSubmitText}
                onClick={handleSubmit}
                className="
                  inline-flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#A88249]
                  px-6
                  text-sm
                  font-medium
                  text-white
                  transition-colors
                  hover:bg-[#977640]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving ? "Compartiendo..." : "Compartir mensaje"}
              </button>
            </>
          )}

          {mode === "audio" && (
            <>
              <div className="rounded-3xl border border-[#E7DCC8] bg-white p-6 text-center">
                {!audioBlob ? (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3ECE2]">
                      <Mic
                        size={30}
                        className="text-[#A88249]"
                      />
                    </div>

                    <p className="text-base font-medium text-[#3F3A34]">
                      {recording
                        ? "Grabando tu mensaje..."
                        : "Presiona para comenzar"}
                    </p>

                    <p className="mt-1 text-sm text-[#8B8378]">
                      Máximo 60 segundos
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3ECE2]">
                      <Volume2
                        size={24}
                        className="text-[#A88249]"
                      />
                    </div>

                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                    />

                    <button
                      type="button"
                      onClick={clearAudioPreview}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-[#7D7467] hover:text-[#3F3A34]"
                    >
                      <Trash2 size={15} />
                      Grabar de nuevo
                    </button>
                  </>
                )}
              </div>

              {recording && (
                <div className="text-center">
                  <p className="text-2xl font-semibold tracking-tight text-[#3F3A34]">
                    00:{String(recordingSeconds).padStart(2, "0")}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEE7DC]">
                    <div
                      className="h-full rounded-full bg-[#A88249] transition-[width] duration-1000"
                      style={{
                        width: `${(recordingSeconds / 60) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!audioBlob ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (recording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#A88249]
                    px-6
                    text-sm
                    font-medium
                    text-white
                    transition-colors
                    hover:bg-[#977640]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {recording ? (
                    <>
                      <Square size={16} fill="currentColor" />
                      Terminar grabación
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      Comenzar grabación
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canSubmitAudio}
                  onClick={handleSubmit}
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#A88249]
                    px-6
                    text-sm
                    font-medium
                    text-white
                    transition-colors
                    hover:bg-[#977640]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Check size={17} />
                  {saving
                    ? "Compartiendo..."
                    : "Compartir audio"}
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
