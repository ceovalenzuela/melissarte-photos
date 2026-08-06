"use client";

import React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  ImageIcon,
  MessageSquare,
  Check,
  Pencil,
} from "lucide-react";

import { Event } from "@/types/event";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  updateEvent,
  uploadCover,
} from "@/lib/events";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  event: Event;
  trigger: React.ReactElement;
}

export default function CustomizationDialog({
  event,
  trigger,
}: Props) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState(
    event.cover_image
  );

const inputRef = useRef<HTMLInputElement>(null);

const [uploadingCover, setUploadingCover] =
  useState(false);

  const [coverSaved, setCoverSaved] =
  useState(false);

  const [editingMessage, setEditingMessage] =
    useState(false);

  const [message, setMessage] =
    useState(event.welcome_message ?? "");

  const [originalMessage, setOriginalMessage] =
    useState(event.welcome_message ?? "");

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
  setCoverImage(event.cover_image);

  const welcome = event.welcome_message ?? "";

  setMessage(welcome);
  setOriginalMessage(welcome);
}, [event]);

  const hasChanges =
    message.trim() !== originalMessage.trim();

  async function handleSaveMessage() {
    try {
      setSaving(true);

      await updateEvent(event.id, {
        welcome_message: message,
      });

      setOriginalMessage(message);

      setSaved(true);
      toast.success("Mensaje actualizado.");

      setTimeout(() => {
        setSaved(false);
        setEditingMessage(false);
      }, 1200);
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);

    const url = await uploadCover(file, event.id);

      await updateEvent(event.id, {
  cover_image: url,
});

setCoverImage(url);

router.refresh();
      setCoverSaved(true);
      toast.success("Portada actualizada.");

      setTimeout(() => {
        setCoverSaved(false);
      }, 1500);
    } catch (error) {
  console.error(error);

  toast.error(
    "No fue posible actualizar la portada."
  );
} finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={trigger} />

      <DialogContent
        className="
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border
          border-[#E7DCC8]
          bg-[#FDFBF8]
          p-0
        "
      >
        <DialogHeader className="border-b border-[#E7DCC8] px-8 py-7">
          <DialogTitle className="text-2xl font-semibold text-[#1F1F1F]">
            ✨ Personalizar galería
          </DialogTitle>

          <p className="mt-2 text-sm text-[#7D7467]">
            Personaliza la portada y el mensaje de bienvenida que verán tus
            invitados.
          </p>
        </DialogHeader>

        <div className="space-y-8 p-8">
          {/* PORTADA */}

          <section>
            <div className="mb-5 flex items-center gap-3">
              <ImageIcon
                size={22}
                className="text-[#A88249]"
              />

              <h3 className="text-lg font-semibold text-[#1F1F1F]">
                Portada
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white">
              {coverImage ? (
                <div
  className="
    relative
    h-[300px]
    w-full
    overflow-hidden
  "
>
<Image
  src={coverImage}
  alt="Portada"
  fill
  className="rounded-2xl object-cover"
/>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-[#7D7467]">
                  Aún no has agregado una portada.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">

<input
  ref={inputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleCoverChange}
/>

 <Button
  disabled={uploadingCover}
  onClick={() => inputRef.current?.click()}
  className="
    h-12
    rounded-full
    border
    border-[#E7DCC8]
    bg-white
    px-6
    text-sm
    font-medium
    text-[#5C554B]
    transition-colors
    duration-200
    hover:bg-[#F7F3EC]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {uploadingCover ? (
    "Subiendo..."
  ) : coverSaved ? (
    <>
      <Check
        size={16}
        className="mr-2"
      />
      Guardado
    </>
  ) : (
    <>
      <ImageIcon
        size={16}
        className="mr-2"
      />
      Cambiar portada
    </>
  )}
</Button>
            </div>
          </section>

          <div className="border-t border-[#E7DCC8]" />

          {/* MENSAJE */}

          <section>
            <div className="mb-5 flex items-center gap-3">
              <MessageSquare
                size={22}
                className="text-[#A88249]"
              />

              <h3 className="text-lg font-semibold text-[#1F1F1F]">
                Mensaje para tus invitados
              </h3>
            </div>

            {!editingMessage ? (
              <>
                <div className="rounded-2xl border border-[#E7DCC8] bg-white px-5 py-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-[#5C554B]">
                    {message.trim()
                      ? message
                      : "Aún no has agregado un mensaje de bienvenida."}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
  onClick={() => {
    setEditingMessage(true);
    setSaved(false);
  }}
  className="
    h-12
    rounded-full
    border
    border-[#E7DCC8]
    bg-white
    px-6
    text-sm
    font-medium
    text-[#5C554B]
    transition-colors
    duration-200
    hover:bg-[#F7F3EC]
  "
>
  <Pencil
    size={16}
    className="mr-2"
  />

  Editar mensaje
</Button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  rows={5}
                  className="
                    resize-none
                    w-full
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

                <div className="mt-6 flex justify-end gap-3">
                  <Button
  onClick={() => {
    setMessage(originalMessage);
    setEditingMessage(false);
    setSaved(false);
  }}
  className="
    h-12
    rounded-full
    border
    border-[#E7DCC8]
    bg-white
    px-6
    text-sm
    font-medium
    text-[#5C554B]
    transition-colors
    duration-200
    hover:bg-[#F7F3EC]
  "
>
  Cancelar
</Button>

                  <Button
  onClick={handleSaveMessage}
  disabled={!hasChanges || saving}
  className="
    h-12
    rounded-full
    bg-[#A88249]
    px-6
    text-sm
    font-medium
    text-white
    transition-colors
    duration-200
    hover:bg-[#977640]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
                    {saving ? (
                      "Guardando..."
                    ) : saved ? (
                      <>
                        <Check
                          size={16}
                          className="mr-2"
                        />
                        Guardado
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}