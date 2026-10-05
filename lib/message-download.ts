import JSZip from "jszip";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { Event } from "@/types/event";
import { getAllMessagesByEvent } from "@/lib/messages";

const BATCH_SIZE = 5;

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "Invitado"
  );
}

function sanitizePdfText(value: string) {
  return value
    .normalize("NFC")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

function formatEventDate(value: string) {
  const date = new Date(value + "T12:00:00");

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? current + " " + word : word;

    if (
      font.widthOfTextAtSize(
        candidate,
        fontSize
      ) <= maxWidth
    ) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

export async function downloadEventMessagesPdf(
  event: Event
) {
  try {
    const messages = (
      await getAllMessagesByEvent(event.id)
    ).filter(
      (message) =>
        message.message_type === "text" &&
        Boolean(message.content?.trim())
    );

    if (messages.length === 0) {
      return {
        success: false as const,
        reason: "NO_TEXT_MESSAGES" as const,
      };
    }

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(
      StandardFonts.Helvetica
    );
    const boldFont = await pdf.embedFont(
      StandardFonts.HelveticaBold
    );
    const italicFont = await pdf.embedFont(
      StandardFonts.HelveticaOblique
    );

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 54;
    const contentWidth = pageWidth - marginX * 2;

    let page = pdf.addPage([
      pageWidth,
      pageHeight,
    ]);

    let y = pageHeight - 64;

    function drawHeader(firstPage: boolean) {
      if (!firstPage) {
        page.drawText("Libro de firmas", {
          x: marginX,
          y: pageHeight - 38,
          size: 9,
          font: boldFont,
          color: rgb(0.64, 0.50, 0.29),
        });

        page.drawLine({
          start: { x: marginX, y: pageHeight - 48 },
          end: {
            x: pageWidth - marginX,
            y: pageHeight - 48,
          },
          thickness: 0.6,
          color: rgb(0.91, 0.86, 0.78),
        });

        return pageHeight - 72;
      }

      page.drawText("LIBRO DE FIRMAS", {
        x: marginX,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0.64, 0.50, 0.29),
      });

      y -= 28;

      const titleLines = wrapText(
        sanitizePdfText(event.title),
        boldFont,
        25,
        contentWidth
      ).slice(0, 3);

      for (const line of titleLines) {
        page.drawText(line, {
          x: marginX,
          y,
          size: 25,
          font: boldFont,
          color: rgb(0.12, 0.10, 0.09),
        });

        y -= 30;
      }

      y -= 2;

      page.drawText(
        sanitizePdfText(
          formatEventDate(event.event_date)
        ),
        {
          x: marginX,
          y,
          size: 11,
          font: italicFont,
          color: rgb(0.43, 0.39, 0.34),
        }
      );

      y -= 24;

      page.drawLine({
        start: { x: marginX, y },
        end: { x: pageWidth - marginX, y },
        thickness: 0.8,
        color: rgb(0.87, 0.81, 0.71),
      });

      return y - 28;
    }

    y = drawHeader(true);

    for (const [index, message] of messages.entries()) {
      const author = sanitizePdfText(
        message.author_name?.trim() || "Invitado"
      );
      const body = sanitizePdfText(
        message.content?.trim() || ""
      );

      let bodyLines = wrapText(
        body,
        regularFont,
        11,
        contentWidth - 42
      );

      if (bodyLines.length > 7) {
        bodyLines = [
          ...bodyLines.slice(0, 6),
          "...",
        ];
      }

      const cardHeight = Math.max(
        82,
        43 + bodyLines.length * 17
      );

      if (y - cardHeight < 54) {
        page = pdf.addPage([
          pageWidth,
          pageHeight,
        ]);
        y = drawHeader(false);
      }

      page.drawRectangle({
        x: marginX,
        y: y - cardHeight,
        width: contentWidth,
        height: cardHeight,
        borderWidth: 0.8,
        borderColor: rgb(0.91, 0.86, 0.78),
        color: rgb(0.995, 0.984, 0.969),
      });

      page.drawText(author, {
        x: marginX + 16,
        y: y - 23,
        size: 11,
        font: boldFont,
        color: rgb(0.25, 0.23, 0.20),
      });

      const label = "Mensaje " + String(index + 1).padStart(2, "0");

      page.drawText(label, {
        x:
          pageWidth -
          marginX -
          16 -
          regularFont.widthOfTextAtSize(
            label,
            8
          ),
        y: y - 22,
        size: 8,
        font: regularFont,
        color: rgb(0.59, 0.54, 0.48),
      });

      let bodyY = y - 47;

      for (const line of bodyLines) {
        page.drawText(line, {
          x: marginX + 16,
          y: bodyY,
          size: 11,
          font: regularFont,
          color: rgb(0.36, 0.33, 0.29),
        });

        bodyY -= 17;
      }

      y -= cardHeight + 12;
    }

    const pages = pdf.getPages();
    const footerLabel =
      messages.length +
      (messages.length === 1
        ? " mensaje compartido"
        : " mensajes compartidos");

    pages.forEach((currentPage, pageIndex) => {
      currentPage.drawText(footerLabel, {
        x: marginX,
        y: 28,
        size: 8,
        font: regularFont,
        color: rgb(0.59, 0.54, 0.48),
      });

      const pageNumber =
        String(pageIndex + 1) +
        " / " +
        String(pages.length);

      const pageNumberWidth =
        regularFont.widthOfTextAtSize(
          pageNumber,
          8
        );

      currentPage.drawText(pageNumber, {
        x:
          pageWidth -
          marginX -
          pageNumberWidth,
        y: 28,
        size: 8,
        font: regularFont,
        color: rgb(0.59, 0.54, 0.48),
      });
    });

    const bytes = await pdf.save();

    triggerDownload(
      new Blob([bytes], {
        type: "application/pdf",
      }),
      safeFileName(event.title) +
        " - Libro de firmas.pdf"
    );

    return {
      success: true as const,
      count: messages.length,
    };
  } catch (error) {
    console.error(
      "No fue posible generar el libro de firmas:",
      error
    );

    return {
      success: false as const,
      reason: "PDF_ERROR" as const,
    };
  }
}

export async function downloadEventAudioMessagesZip(
  event: Event
) {
  try {
    const messages =
      await getAllMessagesByEvent(event.id);

    const audioMessages =
      messages.filter(
        (message) =>
          message.message_type === "audio" &&
          Boolean(message.public_url)
      );

    if (audioMessages.length === 0) {
      return {
        success: false as const,
        reason: "NO_AUDIO_MESSAGES" as const,
      };
    }

    const zip = new JSZip();

    for (
      let index = 0;
      index < audioMessages.length;
      index += BATCH_SIZE
    ) {
      const batch = audioMessages.slice(
        index,
        index + BATCH_SIZE
      );

      const results = await Promise.all(
        batch.map(
          async (message, batchIndex) => {
            try {
              const response = await fetch(
                message.public_url!
              );

              if (!response.ok) {
                return false;
              }

              const blob =
                await response.blob();

              const extension =
                message.file_path
                  ?.split(".")
                  .pop()
                  ?.toLowerCase() || "webm";

              const sequence = String(
                index + batchIndex + 1
              ).padStart(2, "0");

              const author = safeFileName(
                message.author_name?.trim() ||
                  "Invitado"
              );

              zip.file(
                sequence +
                  " - " +
                  author +
                  "." +
                  extension,
                blob
              );

              return true;
            } catch (error) {
              console.warn(
                "No se pudo descargar un mensaje de voz:",
                error
              );
              return false;
            }
          }
        )
      );

      if (
        results.some(
          (success) => !success
        )
      ) {
        return {
          success: false as const,
          reason: "DOWNLOAD_ERROR" as const,
        };
      }
    }

    const zipBlob =
      await zip.generateAsync({
        type: "blob",
      });

    triggerDownload(
      zipBlob,
      safeFileName(event.title) +
        " - Mensajes de voz.zip"
    );

    return {
      success: true as const,
      count: audioMessages.length,
    };
  } catch (error) {
    console.error(
      "No fue posible crear el ZIP de audios:",
      error
    );

    return {
      success: false as const,
      reason: "DOWNLOAD_ERROR" as const,
    };
  }
}
