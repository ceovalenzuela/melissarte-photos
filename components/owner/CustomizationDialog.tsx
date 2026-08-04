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
} from "lucide-react";

import { Event } from "@/types/event";

import { useEffect, useState } from "react";
import { updateEvent } from "@/lib/events";
import { Check } from "lucide-react";
import CoverEditor from "@/components/owner/CoverEditor";

interface Props {
  event: Event;
  trigger: React.ReactElement;
}

export default function CustomizationDialog({
  event,
  trigger,
}: Props) {

const [editingMessage, setEditingMessage] =
  useState(false);

const [message, setMessage] =
  useState(event.welcome_message ?? "");

const [originalMessage, setOriginalMessage] =
  useState(event.welcome_message ?? "");

const [saving, setSaving] = useState(false);

const [saved, setSaved] = useState(false);

useEffect(() => {
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

    setTimeout(() => {
      setSaved(false);
      setEditingMessage(false);
    }, 1200);

  } finally {
    setSaving(false);
  }
}

async function handleCoverSave(
  file: File
) {
  console.log(file);

  alert(
    `Imagen lista para subir.\n\n${file.name}\n${(
      file.size / 1024
    ).toFixed(0)} KB`
  );
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
      className="text-[#B08D57]"
    />

    <h3 className="text-lg font-semibold text-[#1F1F1F]">
      Portada
    </h3>
  </div>

  <CoverEditor
    image={event.cover_image}
    onSave={handleCoverSave}
  />
</section>

          <div className="border-t border-[#E7DCC8]" />

          {/* MENSAJE */}

<section>
  <div className="mb-5 flex items-center gap-3">
    <MessageSquare
      size={22}
      className="text-[#B08D57]"
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
          variant="outline"
          className="rounded-full px-6"
          onClick={() => {
            setEditingMessage(true);
            setSaved(false);
          }}
        >
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
          w-full
          rounded-2xl
          border
          border-[#E7DCC8]
          bg-white
          p-4
          text-[#1F1F1F]
          outline-none
          transition-colors
          focus:border-[#B08D57]
        "
      />

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setMessage(originalMessage);
            setEditingMessage(false);
            setSaved(false);
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSaveMessage}
          disabled={!hasChanges || saving}
          className="rounded-full px-6"
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