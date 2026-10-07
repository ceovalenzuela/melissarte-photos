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

    const bodyFont = await pdf.embedFont(
      StandardFonts.TimesRoman
    );
    const bodyItalicFont = await pdf.embedFont(
      StandardFonts.TimesRomanItalic
    );
    const bodyBoldFont = await pdf.embedFont(
      StandardFonts.TimesRomanBold
    );

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 54;
    const contentWidth = pageWidth - marginX * 2;

    const colors = {
      ink: rgb(0.14, 0.12, 0.10),
      muted: rgb(0.43, 0.39, 0.34),
      softMuted: rgb(0.59, 0.54, 0.48),
      gold: rgb(0.66, 0.51, 0.29),
      cream: rgb(0.985, 0.974, 0.952),
      paper: rgb(0.996, 0.991, 0.982),
      line: rgb(0.87, 0.81, 0.71),
      white: rgb(1, 1, 1),
    };

    function drawCenteredText(
      page: ReturnType<typeof pdf.addPage>,
      text: string,
      y: number,
      size: number,
      font: any,
      color: any
    ) {
      const width = font.widthOfTextAtSize(text, size);

      page.drawText(text, {
        x: (pageWidth - width) / 2,
        y,
        size,
        font,
        color,
      });
    }

    function drawPageFrame(page: ReturnType<typeof pdf.addPage>) {
      page.drawRectangle({
        x: 22,
        y: 22,
        width: pageWidth - 44,
        height: pageHeight - 44,
        borderWidth: 0.7,
        borderColor: colors.line,
      });

      page.drawLine({
        start: { x: 42, y: pageHeight - 54 },
        end: { x: pageWidth - 42, y: pageHeight - 54 },
        thickness: 0.5,
        color: colors.line,
      });

      page.drawLine({
        start: { x: 42, y: 48 },
        end: { x: pageWidth - 42, y: 48 },
        thickness: 0.5,
        color: colors.line,
      });
    }

    // Portada
    let page = pdf.addPage([
      pageWidth,
      pageHeight,
    ]);

    drawPageFrame(page);

    drawCenteredText(
      page,
      "LIBRO DE FIRMAS",
      682,
      10,
      bodyBoldFont,
      colors.gold
    );

    const titleLines = wrapText(
      sanitizePdfText(event.title),
      bodyBoldFont,
      28,
      400
    ).slice(0, 4);

    let coverY = 614;

    for (const line of titleLines) {
      drawCenteredText(
        page,
        line,
        coverY,
        28,
        bodyBoldFont,
        colors.ink
      );
      coverY -= 34;
    }

    page.drawLine({
      start: {
        x: pageWidth / 2 - 52,
        y: coverY - 6,
      },
      end: {
        x: pageWidth / 2 + 52,
        y: coverY - 6,
      },
      thickness: 1,
      color: colors.gold,
    });

    drawCenteredText(
      page,
      sanitizePdfText(formatEventDate(event.event_date)),
      coverY - 34,
      13,
      bodyItalicFont,
      colors.muted
    );

    drawCenteredText(
      page,
      "Palabras compartidas por quienes acompañaron este día.",
      coverY - 88,
      11,
      bodyItalicFont,
      colors.softMuted
    );

    page.drawText("“", {
      x: pageWidth / 2 - 18,
      y: 292,
      size: 64,
      font: bodyItalicFont,
      color: colors.gold,
    });

    page.drawLine({
      start: { x: pageWidth / 2 - 34, y: 214 },
      end: { x: pageWidth / 2 + 34, y: 214 },
      thickness: 0.8,
      color: colors.gold,
    });

    drawCenteredText(
      page,
      messages.length +
        (messages.length === 1
          ? " mensaje"
          : " mensajes"),
      184,
      9,
      bodyBoldFont,
      colors.softMuted
    );

    // Páginas de mensajes
    page = pdf.addPage([
      pageWidth,
      pageHeight,
    ]);

    let y = pageHeight - 82;

    function drawMessageHeader() {
      page.drawText("LIBRO DE FIRMAS", {
        x: marginX,
        y: pageHeight - 38,
        size: 9,
        font: bodyBoldFont,
        color: colors.gold,
      });

      const title = sanitizePdfText(event.title);
      const titleWidth = bodyBoldFont.widthOfTextAtSize(
        title,
        8
      );

      if (titleWidth <= 225) {
        page.drawText(title, {
          x:
            pageWidth -
            marginX -
            titleWidth,
          y: pageHeight - 38,
          size: 8,
          font: bodyItalicFont,
          color: colors.softMuted,
        });
      }

      page.drawLine({
        start: { x: marginX, y: pageHeight - 50 },
        end: {
          x: pageWidth - marginX,
          y: pageHeight - 50,
        },
        thickness: 0.6,
        color: colors.line,
      });

      y = pageHeight - 78;
    }

    function drawFooter(
      targetPage: ReturnType<typeof pdf.addPage>,
      pageIndex: number,
      totalPages: number
    ) {
      targetPage.drawText(
        "Melissarte Photos · Recuerdos compartidos",
        {
          x: marginX,
          y: 30,
          size: 7.5,
          font: bodyItalicFont,
          color: colors.softMuted,
        }
      );

      const pageNumber = String(pageIndex) +
        " / " +
        String(totalPages);

      const pageNumberWidth =
        bodyFont.widthOfTextAtSize(pageNumber, 7.5);

      targetPage.drawText(pageNumber, {
        x:
          pageWidth -
          marginX -
          pageNumberWidth,
        y: 30,
        size: 7.5,
        font: bodyFont,
        color: colors.softMuted,
      });
    }

    drawPageFrame(page);
    drawMessageHeader();

    for (const [index, message] of messages.entries()) {
      const author = sanitizePdfText(
        message.author_name?.trim() || "Invitado"
      );

      const body = sanitizePdfText(
        message.content?.trim() || ""
      );

      let bodyLines = wrapText(
        body,
        bodyFont,
        11.5,
        contentWidth - 72
      );

      if (bodyLines.length > 8) {
        bodyLines = [
          ...bodyLines.slice(0, 7),
          "...",
        ];
      }

      const cardHeight = Math.max(
        92,
        52 + bodyLines.length * 18
      );

      if (y - cardHeight < 72) {
        page = pdf.addPage([
          pageWidth,
          pageHeight,
        ]);

        drawPageFrame(page);
        drawMessageHeader();
      }

      const cardY = y - cardHeight;

      page.drawRectangle({
        x: marginX,
        y: cardY,
        width: contentWidth,
        height: cardHeight,
        color: colors.paper,
        borderWidth: 0.7,
        borderColor: colors.line,
      });

      page.drawRectangle({
        x: marginX,
        y: cardY,
        width: 4,
        height: cardHeight,
        color: colors.gold,
      });

      page.drawText("“", {
        x: marginX + 16,
        y: y - 38,
        size: 26,
        font: bodyItalicFont,
        color: colors.gold,
      });

      page.drawText(author, {
        x: marginX + 43,
        y: y - 24,
        size: 11.5,
        font: bodyBoldFont,
        color: colors.ink,
      });

      const label = String(index + 1).padStart(2, "0");

      page.drawText(label, {
        x:
          pageWidth -
          marginX -
          17 -
          bodyFont.widthOfTextAtSize(label, 8),
        y: y - 24,
        size: 8,
        font: bodyFont,
        color: colors.softMuted,
      });

      let bodyY = y - 49;

      for (const line of bodyLines) {
        page.drawText(line, {
          x: marginX + 43,
          y: bodyY,
          size: 11.5,
          font: bodyFont,
          color: colors.muted,
        });

        bodyY -= 18;
      }

      y = cardY - 14;
    }

    const pages = pdf.getPages();

    pages.forEach((currentPage, pageIndex) => {
      drawFooter(
        currentPage,
        pageIndex + 1,
        pages.length
      );
    });

    const bytes = await pdf.save();
    const pdfBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(pdfBuffer).set(bytes);

    triggerDownload(
      new Blob([pdfBuffer], {
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
