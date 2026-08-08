import QRCode from "qrcode";

import { Event } from "@/types/event";
import { getEventUrl } from "@/lib/urls";

async function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject();
    image.src = src;
  });
}

export async function downloadEventQrCard(
  event: Event
): Promise<void> {
  const url = getEventUrl(
    window.location.origin,
    event.slug
  );

  // QR en muy alta resolución
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 1800,
    margin: 1,
    errorCorrectionLevel: "H",
  });

  const [logo, qrImage] = await Promise.all([
    loadImage("/me-logo.png"),
    loadImage(qrDataUrl),
  ]);

  const canvas = document.createElement("canvas");

  canvas.width = 2400;
  canvas.height = 2400;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo crear el canvas.");
  }

  // ===================================
  // Calidad
  // ===================================

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ===================================
  // Fondo
  // ===================================

  ctx.fillStyle = "#FFFFFF";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ===================================
  // Logo
  // ===================================

  const logoWidth = 420;

  const logoHeight =
    (logo.height / logo.width) * logoWidth;

  const logoY = 80;

  ctx.drawImage(
    logo,
    (canvas.width - logoWidth) / 2,
    logoY,
    logoWidth,
    logoHeight
  );

  // ===================================
  // Evento
  // ===================================

  const eventY =
    logoY + logoHeight + 90;

  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.font = "bold 72px Arial";

  ctx.fillText(
    event.title,
    canvas.width / 2,
    eventY
  );

  // ===================================
  // Descripción
  // ===================================

  ctx.fillStyle = "#6B7280";
  ctx.font = "42px Arial";

  ctx.fillText(
    "Escanea para acceder a la galería",
    canvas.width / 2,
    eventY + 75
  );

  // ===================================
  // QR
  // ===================================

  const qrSize = 1350;

  const qrY = eventY + 150;

  ctx.drawImage(
    qrImage,
    (canvas.width - qrSize) / 2,
    qrY,
    qrSize,
    qrSize
  );

  // ===================================
  // URL
  // ===================================

  ctx.fillStyle = "#6B7280";
  ctx.font = "36px Arial";

  ctx.fillText(
    url.replace(/^https?:\/\//, ""),
    canvas.width / 2,
    qrY + qrSize + 90
  );

  // ===================================
  // Descargar
  // ===================================

  const link = document.createElement("a");

  link.href = canvas.toDataURL("image/png");

  link.download = `QR - ${event.title}.png`;

  link.click();
}