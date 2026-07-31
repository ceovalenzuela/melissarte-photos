import QRCode from "qrcode";

import { Event } from "@/types/event";
import { getEventUrl } from "@/lib/urls";

async function loadImage(src: string): Promise<HTMLImageElement> {
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
  // Calidad máxima
  // ===================================

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ===================================
  // Fondo
  // ===================================

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ===================================
// Logo
// ===================================

const logoWidth = 700;

const logoHeight =
  (logo.height / logo.width) * logoWidth;

const logoY = 50;

ctx.drawImage(
  logo,
  (canvas.width - logoWidth) / 2,
  logoY,
  logoWidth,
  logoHeight
);

// Punto donde termina el logo
const headerBottom =
  logoY + logoHeight + 35;

  // ===================================
  // Evento
  // ===================================

  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.font = "bold 82px Arial";

  ctx.fillText(
    event.title,
    canvas.width / 2,
    headerBottom
  );

  // ===================================
  // Mensaje
  // ===================================

  ctx.fillStyle = "#4B5563";
  ctx.font = "58px Arial";

  ctx.fillText(
    "Escanea para vivir",
    canvas.width / 2,
    headerBottom + 90
  );

  ctx.fillText(
    "y compartir este momento",
    canvas.width / 2,
    headerBottom + 165
  );

  // ===================================
  // QR
  // ===================================

  const qrSize = 1250;

  const qrY = headerBottom + 180;

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
  ctx.font = "42px Arial";

  ctx.fillText(
    url.replace(/^https?:\/\//, ""),
    canvas.width / 2,
    qrY + qrSize + 60
  );

  // ===================================
  // Descargar
  // ===================================

  const link = document.createElement("a");

  link.href = canvas.toDataURL("image/png");

  link.download = `QR - ${event.title}.png`;

  link.click();
}