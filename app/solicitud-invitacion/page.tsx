"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  CalendarDays, Camera, CheckCircle2, Copy, Download, Gift, MapPin, Minus,
  MessageCircle, Palette, PartyPopper, Plus, ShieldCheck, Sparkles, Upload, Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type EventType = "boda" | "xv" | "baby_shower" | "revelacion" | "bautizo" | "otro";
type Plan = "esencial" | "plus" | "";
type ColorPreference = "plantilla" | "alternativa1" | "alternativa2";
type RequestData = {
  eventType: EventType | ""; otherEventType: string; plan: Plan; headline: string; eventDate: string;
  receptionTime: string; receptionVenue: string; receptionAddress: string; hostNames: string;
  introduction: string; hasReligiousCeremony: boolean; religiousTime: string; religiousVenue: string;
  religiousAddress: string; dressCode: string; rsvpDeadline: string; giftMessage: string;
  giftType: string; giftRegistryLabel: string; giftRegistryUrl: string; confirmationPhone: string;
  maxPartySize: string; colorPreference: ColorPreference;
};

const WHATSAPP_MELISSARTE = "528133867050";
const INITIAL_FORM: RequestData = {
  eventType: "", otherEventType: "", plan: "", headline: "", eventDate: "",
  receptionTime: "", receptionVenue: "", receptionAddress: "", hostNames: "", introduction: "",
  hasReligiousCeremony: false, religiousTime: "", religiousVenue: "", religiousAddress: "",
  dressCode: "", rsvpDeadline: "", giftMessage: "", giftType: "", giftRegistryLabel: "",
  giftRegistryUrl: "", confirmationPhone: "", maxPartySize: "2", colorPreference: "plantilla",
};

const EVENT_TYPES: { value: EventType; label: string; description: string }[] = [
  { value: "boda", label: "Boda", description: "Para celebrar su unión." },
  { value: "xv", label: "XV años", description: "Para una celebración de gala." },
  { value: "baby_shower", label: "Baby shower", description: "Para celebrar la llegada de un bebé." },
  { value: "revelacion", label: "Revelación de género", description: "Para compartir la noticia con familia y amigos." },
  { value: "bautizo", label: "Bautizo", description: "Para una celebración familiar y religiosa." },
  { value: "otro", label: "Otro evento", description: "Para cualquier otra celebración." },
];

type PaletteChoice = { value: ColorPreference; label: string; description: string; colors: string[] };
type PaletteAlternative = Omit<PaletteChoice, "value">;

const ALTERNATIVE_PALETTES: Record<EventType, [PaletteAlternative, PaletteAlternative]> = {
  boda: [
    { label: "Verde salvia, marfil y dorado", description: "Natural, luminoso y elegante.", colors: ["#9EAF9A", "#F6F1E7", "#C5A66A"] },
    { label: "Borgoña, champagne y crema", description: "Romántico y sofisticado, con tonos profundos.", colors: ["#713543", "#E7D4B7", "#FFF7EA"] },
  ],
  xv: [
    { label: "Rosa empolvado, oro rosa y marfil", description: "Romántico y glamuroso, sin tonos demasiado intensos.", colors: ["#D9A1AA", "#B8757D", "#FFF5EC"] },
    { label: "Lavanda, plata y lila", description: "Delicado, moderno y luminoso.", colors: ["#B9A5D2", "#B9BEC8", "#F1EAF7"] },
  ],
  baby_shower: [
    { label: "Verde salvia, avena y marfil", description: "Neutro, natural y sereno.", colors: ["#A5B59D", "#D9CBB4", "#FAF6EE"] },
    { label: "Amarillo mantequilla, durazno y crema", description: "Cálido, dulce y suave.", colors: ["#F2D574", "#E5A28A", "#FFF5E8"] },
  ],
  revelacion: [
    { label: "Amarillo suave, salvia y marfil", description: "Una opción neutra que une tonos cálidos y naturales.", colors: ["#F1D16C", "#A0B39A", "#FFF6E8"] },
    { label: "Durazno, celeste y crema", description: "Equilibrado, fresco y apropiado para una revelación.", colors: ["#E7A18A", "#8CB9CF", "#FFF5E8"] },
  ],
  bautizo: [
    { label: "Verde salvia, marfil y dorado tenue", description: "Clásico, natural y delicado.", colors: ["#9EAF9A", "#F8F4EA", "#C7AD72"] },
    { label: "Azul empolvado, beige y blanco cálido", description: "Sereno, luminoso y atemporal.", colors: ["#9AB6C9", "#D6C5AD", "#FBF8F1"] },
  ],
  otro: [
    { label: "Terracota, arena y verde olivo", description: "Cálido y natural para una celebración con personalidad.", colors: ["#B96F54", "#E7D3B8", "#6D7652"] },
    { label: "Azul profundo, champagne y marfil", description: "Elegante y versátil para eventos formales.", colors: ["#23374B", "#D2B478", "#F7F2E8"] },
  ],
};

const PLAN_DETAILS: Record<Exclude<Plan, "">, { title: string; description: string }> = {
  esencial: {
    title: "Esencial",
    description: "Tus invitados confirman por WhatsApp al número que nos compartas.",
  },
  plus: {
    title: "Plus",
    description: "Tus invitados confirman desde la invitación y podrás consultar sus respuestas.",
  },
};

type TemplateSuggestion = { label: string; description: string; colors: string[] };
function getSuggestedTemplate(eventType: EventType | ""): TemplateSuggestion {
  if (eventType === "xv") return {
    label: "XV años · Gala",
    description: "Ciruela, malva y dorado suave.",
    colors: ["#211B35", "#805773", "#E2C47A"],
  };
  if (eventType === "baby_shower" || eventType === "revelacion") return {
    label: "Baby · Suave",
    description: "Durazno, terracota y celeste.",
    colors: ["#FFF4E8", "#A85F47", "#3F7184"],
  };
  if (eventType === "bautizo") return {
    label: "Bautizo · Luz",
    description: "Marfil y azul grisáceo.",
    colors: ["#FAF7F0", "#426D86", "#C7DBE5"],
  };
  if (eventType === "boda") return {
    label: "Boda · Editorial",
    description: "Azul noche, marfil y champagne.",
    colors: ["#F5F0E7", "#D5B77C", "#111B29"],
  };
  return {
    label: eventType === "otro" ? "Diseño sugerido para tu evento" : "Elige el tipo de evento",
    description: eventType === "otro"
      ? "Te recomendaremos una opción que se adapte a tu celebración."
      : "Al elegir tu evento verás aquí el diseño sugerido.",
    colors: ["#F5F0E7", "#D5B77C", "#111B29"],
  };
}

function getColorOptions(eventType: EventType | ""): PaletteChoice[] {
  const template = getSuggestedTemplate(eventType);
  const alternatives = eventType ? ALTERNATIVE_PALETTES[eventType] : ALTERNATIVE_PALETTES.otro;
  return [
    {
      value: "plantilla",
      label: "Colores originales",
      description: template.description,
      colors: template.colors,
    },
    { value: "alternativa1", ...alternatives[0] },
    { value: "alternativa2", ...alternatives[1] },
  ];
}

function colorPreferenceLabel(value: ColorPreference, eventType: EventType | "") {
  return getColorOptions(eventType).find((item) => item.value === value)?.label ?? "Colores originales";
}

function digits(value: string) { return value.replace(/\D/g, ""); }
function normalizeConfirmationPhone(value: string) {
  const phone = digits(value);
  return phone.length === 10 ? "52" + phone : phone;
}
function formatDate(value: string) {
  if (!value) return "";
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !part)) return value;
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function getEventLabel(data: RequestData) {
  if (data.eventType === "otro") return data.otherEventType.trim();
  return EVENT_TYPES.find((item) => item.value === data.eventType)?.label ?? "Evento";
}


function createRequestText(data: RequestData, coverUrl: string) {
  const template = getSuggestedTemplate(data.eventType);
  const selectedPalette = getColorOptions(data.eventType).find((item) => item.value === data.colorPreference);
  const lines = [
    "SOLICITUD DE INVITACIÓN DIGITAL · MELISSARTE", "",
    "TIPO DE EVENTO: " + getEventLabel(data),
    "INVITACIÓN: " + (data.plan === "esencial" ? "ESENCIAL" : "PLUS"), "",
    "DATOS PRINCIPALES",
    "Nombres o título para la portada: " + data.headline.trim(),
    "Fecha del evento: " + formatDate(data.eventDate),
    "Hora de recepción: " + data.receptionTime,
    "Lugar de recepción: " + data.receptionVenue.trim(),
    "Dirección de recepción: " + data.receptionAddress.trim(),
  ];
  if (data.hostNames.trim()) lines.push("Nombres de quienes invitan: " + data.hostNames.trim());
  if (data.introduction.trim()) lines.push("Mensaje breve: " + data.introduction.trim());

  lines.push("", "CEREMONIA ADICIONAL");
  if (data.hasReligiousCeremony) {
    lines.push(
      "Incluir ceremonia: Sí",
      "Hora: " + (data.religiousTime || "Por definir"),
      "Iglesia o recinto: " + (data.religiousVenue.trim() || "Por definir"),
      "Dirección: " + (data.religiousAddress.trim() || "Por definir"),
    );
  } else {
    lines.push("Incluir ceremonia adicional: No");
  }

  lines.push("", "DETALLES OPCIONALES");
  if (data.dressCode.trim()) lines.push("Código de vestimenta: " + data.dressCode.trim());
  if (data.plan === "plus" && data.rsvpDeadline) lines.push("Fecha límite para confirmar: " + formatDate(data.rsvpDeadline));
  if (data.giftMessage.trim()) lines.push("Mensaje sobre regalos: " + data.giftMessage.trim());
  if (data.giftType.trim()) lines.push("Preferencia de regalo: " + data.giftType.trim());
  if (data.giftRegistryUrl.trim()) {
    lines.push("Mesa de regalos: " + data.giftRegistryUrl.trim());
    if (data.giftRegistryLabel.trim()) lines.push("Texto del botón de regalos: " + data.giftRegistryLabel.trim());
  }

  lines.push("", "CONFIRMACIÓN DE ASISTENCIA");
  if (data.plan === "esencial") {
    lines.push("Modalidad: Confirmación por WhatsApp", "WhatsApp para recibir confirmaciones: +" + normalizeConfirmationPhone(data.confirmationPhone));
  } else {
    lines.push("Modalidad: Confirmación desde la invitación");
  }
  lines.push("Máximo de personas por confirmación: " + data.maxPartySize);

  lines.push(
    "", "SUGERENCIA DE DISEÑO",
    "Diseño sugerido: " + template.label,
    "Preferencia de color: " + colorPreferenceLabel(data.colorPreference, data.eventType),
    "Colores de referencia (HEX): " + (selectedPalette?.colors ?? template.colors).join(", "),
    "", "FOTO DE PORTADA",
    "Enlace a la foto: " + coverUrl,
  );
  return lines.join("\n");
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return <span className="mb-1.5 block text-sm font-semibold text-[#3B342E]">
    {children}
    {required ? <span className="ml-1 text-[#A85F47]" aria-hidden="true">*</span> : <span className="ml-2 text-xs font-normal text-[#71675D]">Opcional</span>}
  </span>;
}

function TextInput({
  label, value, onChange, placeholder, required = false, type = "text", maxLength, help,
}: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
  required?: boolean; type?: "text" | "time" | "date" | "url" | "tel"; maxLength?: number; help?: string;
}) {
  return <label className="block min-w-0">
    <FieldLabel required={required}>{label}</FieldLabel>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder} required={required} maxLength={maxLength}
      className="w-full rounded-xl border border-[#DDD3C5] bg-white px-3.5 py-3 text-sm text-[#302B27] outline-none transition placeholder:text-[#81776D] focus:border-[#9C7A4A] focus:ring-2 focus:ring-[#9C7A4A]/15" />
    {help && <span className="mt-1.5 block text-xs leading-5 text-[#62594F]">{help}</span>}
  </label>;
}

function TextArea({
  label, value, onChange, placeholder, maxLength, rows = 3,
}: {
  label: string; value: string; onChange: (value: string) => void;
  placeholder?: string; maxLength?: number; rows?: number;
}) {
  return <label className="block min-w-0">
    <FieldLabel>{label}</FieldLabel>
    <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full resize-y rounded-xl border border-[#DDD3C5] bg-white px-3.5 py-3 text-sm leading-6 text-[#302B27] outline-none transition placeholder:text-[#81776D] focus:border-[#9C7A4A] focus:ring-2 focus:ring-[#9C7A4A]/15" />
    {maxLength && <span className="mt-1 block text-right text-xs text-[#71675D]">{value.length}/{maxLength} caracteres</span>}
  </label>;
}

function Section({
  number, title, description, icon, children,
}: { number: string; title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#E8DED0] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(54,42,27,0.035)] sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1E8DB] text-[#765B38]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B6C42]">Sección {number}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#302B27] sm:text-xl">{title}</h2>
        <p className="mt-1.5 text-sm leading-6 text-[#62594F]">{description}</p>
      </div>
    </div>
    {children}
  </section>;
}

export default function InvitationRequestPage() {
  const [form, setForm] = useState<RequestData>(INITIAL_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverError, setCoverError] = useState("");
  const [formError, setFormError] = useState("");
  const [requestText, setRequestText] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [preparingMessage, setPreparingMessage] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState("");
  const formStartedAtRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formStartedAtRef.current === null) formStartedAtRef.current = Date.now();
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function updateForm<K extends keyof RequestData>(key: K, value: RequestData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setRequestText("");
    setWhatsAppUrl("");
  }

  function clearPreparedMessage() {
    setRequestText("");
    setWhatsAppUrl("");
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    clearPreparedMessage();

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setCoverError("Elige una imagen JPG, PNG o WebP.");
      setCoverFile(null);
      setCoverPreview("");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCoverError("La imagen debe pesar menos de 10 MB.");
      setCoverFile(null);
      setCoverPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalHeight <= image.naturalWidth) {
        URL.revokeObjectURL(previewUrl);
        setCoverError("La imagen debe ser vertical, es decir, más alta que ancha. Recomendamos proporción 4:5.");
        setCoverFile(null);
        setCoverPreview("");
        return;
      }
      setCoverFile(file);
      setCoverPreview(previewUrl);
      setCoverError("");
      setFormError("");
    };
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setCoverError("No pudimos abrir esa imagen. Prueba con otra foto JPG, PNG o WebP.");
      setCoverFile(null);
      setCoverPreview("");
    };
    image.src = previewUrl;
  }

  function validateForm(): boolean {
    setFormError("");
    if (!form.eventType) {
      setFormError("Selecciona el tipo de evento.");
      return false;
    }
    if (form.eventType === "otro" && !form.otherEventType.trim()) {
      setFormError("Indica qué tipo de evento vas a celebrar.");
      return false;
    }
    if (!form.plan) {
      setFormError("Selecciona el tipo de invitación que contrataste.");
      return false;
    }
    if (!form.headline.trim()) {
      setFormError("Escribe los nombres o el título principal que aparecerá en la portada.");
      return false;
    }
    if (!form.eventDate) {
      setFormError("Selecciona la fecha del evento.");
      return false;
    }
    const now = new Date();
    const localToday = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    if (form.eventDate < localToday) {
      setFormError("La fecha del evento no puede ser anterior a hoy.");
      return false;
    }
    if (!form.receptionTime || !form.receptionVenue.trim() || !form.receptionAddress.trim()) {
      setFormError("Completa la hora, el lugar y la dirección de la recepción.");
      return false;
    }
    if (form.hasReligiousCeremony && !form.religiousTime && !form.religiousVenue.trim() && !form.religiousAddress.trim()) {
      setFormError("Si incluyes ceremonia, completa al menos uno de sus datos.");
      return false;
    }
    if (form.plan === "esencial") {
      const phone = digits(form.confirmationPhone);
      if (phone.length < 10 || phone.length > 15) {
        setFormError("Escribe un WhatsApp válido para recibir las confirmaciones, incluyendo la lada internacional si corresponde.");
        return false;
      }
    }
    if (!coverFile) {
      setFormError("Selecciona una foto de portada vertical para continuar.");
      setCoverError("Necesitas seleccionar una foto vertical para la portada.");
      return false;
    }
    if (form.giftRegistryUrl.trim()) {
      try {
        const parsed = new URL(form.giftRegistryUrl.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("URL inválida");
      } catch {
        setFormError("Revisa el enlace de la mesa de regalos. Debe comenzar con https:// o http://.");
        return false;
      }
    }
    if (form.plan === "plus" && form.rsvpDeadline && form.rsvpDeadline > form.eventDate) {
      setFormError("La fecha límite para confirmar no puede ser posterior a la fecha del evento.");
      return false;
    }
    if (form.plan === "plus" && form.rsvpDeadline && form.rsvpDeadline < localToday) {
      setFormError("La fecha límite para confirmar no puede ser anterior a hoy.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preparingMessage || !validateForm() || !coverFile) return;
    const requestData = { ...form };
    const imageFile = coverFile;
    setPreparingMessage(true);
    setFormError("");
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      const { data, error } = await supabase.functions.invoke("prepare-invitation-request-cover", {
        body: {
          content_type: imageFile.type,
          website: honeypotValue,
          elapsed_ms: formStartedAtRef.current === null ? 0 : Date.now() - formStartedAtRef.current,
        },
      });
      if (error || data?.success !== true || typeof data.path !== "string" || typeof data.token !== "string") {
        throw new Error(data?.error ?? error?.message ?? "No fue posible preparar la carga de la imagen.");
      }

      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .uploadToSignedUrl(data.path, data.token, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: publicImage } = supabase.storage.from("event-covers").getPublicUrl(data.path);
      if (!publicImage.publicUrl) throw new Error("No fue posible crear el enlace de la imagen.");

      const message = createRequestText(requestData, publicImage.publicUrl);
      const url = "https://wa.me/" + WHATSAPP_MELISSARTE + "?text=" + encodeURIComponent(message);
      setRequestText(message);
      setWhatsAppUrl(url);

      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = url;
        setFormError("");
      } else {
        setFormError("Tus datos quedaron preparados. Usa «Abrir WhatsApp» abajo para compartirlos.");
      }
      window.setTimeout(() => document.getElementById("solicitud-preparada")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      console.error("No fue posible preparar la solicitud de invitación:", error);
      setFormError("No pudimos subir la foto y preparar el mensaje. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setPreparingMessage(false);
    }
  }

  async function copyRequest() {
    if (!requestText) return;
    try {
      await navigator.clipboard.writeText(requestText);
      window.alert("El resumen quedó copiado. Ya puedes pegarlo en WhatsApp.");
    } catch {
      window.prompt("Copia el texto completo de tu solicitud:", requestText);
    }
  }

  function downloadRequest() {
    if (!requestText) return;
    const blob = new Blob(["\uFEFF" + requestText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "solicitud-invitacion-melissarte.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#EFE4D3_0%,transparent_42rem),linear-gradient(180deg,#FAF7F1_0%,#F4EFE7_100%)] px-4 py-6 text-[#302B27] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="relative mb-6 overflow-hidden rounded-3xl border border-[#DCCBB2] bg-[#FFFEFC] shadow-[0_18px_54px_rgba(54,42,27,0.07)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#34465D] via-[#D5B77C] to-[#A85F47]" />
          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8DED0] bg-[#FBF7F0] px-3 py-1.5 text-xs font-semibold text-[#725A3C]"><Sparkles size={14} /> Invitaciones digitales personalizadas</div>
            <h1 className="font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-[#302B27] sm:text-4xl">Cuéntanos los detalles de tu evento</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#62594F] sm:text-base">Completa este formulario para que podamos preparar tu invitación. Solo pedimos los datos necesarios y algunas preferencias sencillas para orientar el diseño.</p>
            <div className="mt-5 rounded-2xl border border-[#E8DED0] bg-[#FBF7F0] p-4">
              <p className="text-sm leading-6 text-[#4E463D]"><strong>* Obligatorio.</strong> Los campos opcionales pueden dejarse vacíos.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section number="1" title="Tipo de evento e invitación" description="Elige el tipo de celebración y el tipo de invitación que contrataste." icon={<PartyPopper size={20} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {EVENT_TYPES.map((item) => {
                const selected = form.eventType === item.value;
                return <label key={item.value} className={"flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition " + (selected ? "border-[#967544] bg-[#F8F1E5] ring-1 ring-[#967544]/20" : "border-[#E8DED0] bg-white hover:border-[#CBB797]")}>
                  <input type="radio" name="eventType" value={item.value} checked={selected} onChange={() => updateForm("eventType", item.value)} required className="mt-1 h-4 w-4 shrink-0 accent-[#8B6C42]" />
                  <span className="min-w-0"><span className="block text-sm font-semibold text-[#302B27]">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#62594F]">{item.description}</span></span>
                </label>;
              })}
            </div>
            {form.eventType === "otro" && <div className="mt-4"><TextInput label="¿Qué tipo de evento es?" value={form.otherEventType} onChange={(value) => updateForm("otherEventType", value)} placeholder="Ej. graduación, aniversario..." required maxLength={80} /></div>}

            <div className="mt-5 border-t border-[#E8DED0] pt-5">
              <p className="mb-3 text-sm font-semibold text-[#3B342E]">Tipo de invitación <span className="text-[#A85F47">*</span></p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["esencial", "plus"] as const).map((plan) => {
                  const details = PLAN_DETAILS[plan];
                  const selected = form.plan === plan;
                  return <label key={plan} className={"relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition " + (selected ? "border-[#967544] bg-[#F8F1E5] ring-1 ring-[#967544]/20" : "border-[#E8DED0] bg-white hover:border-[#CBB797]")}>
                    <input type="radio" name="plan" value={plan} checked={selected} onChange={() => updateForm("plan", plan)} required className="mt-1 h-4 w-4 shrink-0 accent-[#8B6C42]" />
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-[#302B27]">{details.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-[#62594F]">{details.description}</span>
                    </span>
                  </label>;
                })}
              </div>
            </div>
          </Section>

          <Section number="2" title="Datos principales" description="Estos datos son necesarios para preparar la invitación. La fecha del evento es indispensable." icon={<CalendarDays size={20} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><TextInput label="Nombres o título principal que aparecerá en la portada" value={form.headline} onChange={(value) => updateForm("headline", value)} placeholder="Ej. Sofía y Alejandro" required maxLength={120} help="Usaremos estos nombres como título principal; el diseño y los textos base de la plantilla se conservan." /></div>
              <TextInput label="Fecha del evento" value={form.eventDate} onChange={(value) => updateForm("eventDate", value)} type="date" required />
              <TextInput label="Hora de recepción" value={form.receptionTime} onChange={(value) => updateForm("receptionTime", value)} type="time" required />
              <TextInput label="Lugar de recepción" value={form.receptionVenue} onChange={(value) => updateForm("receptionVenue", value)} placeholder="Ej. Jardín Los Olivos" required maxLength={160} />
              <div className="sm:col-span-2"><TextInput label="Dirección de la recepción" value={form.receptionAddress} onChange={(value) => updateForm("receptionAddress", value)} placeholder="Calle, número, colonia, ciudad y estado" required maxLength={250} help="Incluye suficiente información para que los invitados encuentren el lugar en el mapa." /></div>
              <TextInput label="Nombres de quienes invitan" value={form.hostNames} onChange={(value) => updateForm("hostNames", value)} placeholder="Ej. Con cariño, nuestras familias" maxLength={160} />
              <div className="sm:col-span-2"><TextArea label="Mensaje breve para los invitados" value={form.introduction} onChange={(value) => updateForm("introduction", value)} placeholder="Opcional. Si lo dejas vacío, usaremos el mensaje predeterminado de la plantilla." maxLength={240} /></div>
            </div>
          </Section>

          <Section number="3" title="Ceremonia adicional" description="Si habrá una ceremonia en otro lugar, activa esta sección. Si no aplica, déjala desactivada." icon={<MapPin size={20} />}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E8DED0] bg-white p-4">
              <input type="checkbox" checked={form.hasReligiousCeremony} onChange={(event) => updateForm("hasReligiousCeremony", event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#8B6C42]" />
              <span><span className="block text-sm font-semibold text-[#302B27]">Sí, quiero incluir una tarjeta independiente de ceremonia</span><span className="mt-1 block text-xs leading-5 text-[#62594F]">Por ejemplo, iglesia o templo antes de la recepción.</span></span>
            </label>
            {form.hasReligiousCeremony && <div className="mt-4 grid gap-4 rounded-xl bg-[#F8F5EF] p-4 sm:grid-cols-2">
              <TextInput label="Hora de la ceremonia" value={form.religiousTime} onChange={(value) => updateForm("religiousTime", value)} type="time" />
              <TextInput label="Iglesia o recinto" value={form.religiousVenue} onChange={(value) => updateForm("religiousVenue", value)} placeholder="Nombre del lugar" maxLength={160} />
              <div className="sm:col-span-2"><TextInput label="Dirección de la ceremonia" value={form.religiousAddress} onChange={(value) => updateForm("religiousAddress", value)} placeholder="Calle, número, ciudad" maxLength={250} /></div>
              <p className="sm:col-span-2 text-xs leading-5 text-[#62594F]">Completa al menos uno de los datos de la ceremonia. Los demás se pueden dejar pendientes.</p>
            </div>}
          </Section>

          <Section number="4" title="Vestimenta y regalos" description="Completa únicamente lo que quieras mostrar en la invitación." icon={<Gift size={20} />}>
            <div className="space-y-4">
              <TextInput label="Código de vestimenta" value={form.dressCode} onChange={(value) => updateForm("dressCode", value)} placeholder="Ej. Formal, formal de noche, colores claros..." maxLength={120} />
              {form.plan === "plus" && <TextInput label="Fecha límite para confirmar asistencia" value={form.rsvpDeadline} onChange={(value) => updateForm("rsvpDeadline", value)} type="date" help="Opcional. Se aceptarán respuestas hasta el final de ese día." />}
              <TextArea label="Mensaje sobre regalos" value={form.giftMessage} onChange={(value) => updateForm("giftMessage", value)} placeholder="Ej. Su presencia es nuestro mejor regalo..." maxLength={300} />
              <TextInput label="Preferencia de regalo" value={form.giftType} onChange={(value) => updateForm("giftType", value)} placeholder="Ej. Sobre, regalo en efectivo o algún detalle" maxLength={120} />
              <TextInput label="Enlace a mesa de regalos" value={form.giftRegistryUrl} onChange={(value) => updateForm("giftRegistryUrl", value)} type="url" placeholder="https://..." maxLength={1000} help="Si agregas un enlace, también puedes indicar el texto del botón." />
              {form.giftRegistryUrl.trim() && <TextInput label="Texto del botón de regalos" value={form.giftRegistryLabel} onChange={(value) => updateForm("giftRegistryLabel", value)} placeholder="Ej. Ver mesa de regalos" maxLength={50} />}
            </div>
          </Section>

          <Section number="5" title="Confirmación de asistencia" description="La forma de confirmar depende del plan seleccionado." icon={<Users size={20} />}>
            {form.plan === "esencial" ? (
              <div className="rounded-2xl border border-[#D8E5D9] bg-[#F4F8F3] p-4 sm:p-5">
                <p className="text-sm font-semibold text-[#294E35]">Esencial · Confirmaciones por WhatsApp</p>
                <p className="mt-1 text-sm leading-6 text-[#4E5E50]">Indica el número al que tus invitados enviarán su confirmación. Incluye la lada internacional; si escribes 10 dígitos, agregaremos +52.</p>
                <div className="mt-4"><TextInput label="WhatsApp para recibir las confirmaciones" value={form.confirmationPhone} onChange={(value) => updateForm("confirmationPhone", value)} placeholder="Ej. 528112345678 o 8112345678" type="tel" required maxLength={20} help="Puede ser distinto al WhatsApp de Melissarte al que enviarás este formulario." /></div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#D8E5D9] bg-[#F4F8F3] p-4 sm:p-5">
                <p className="text-sm font-semibold text-[#294E35]">Plus · Confirmación con registro</p>
                <p className="mt-1 text-sm leading-6 text-[#4E5E50]">Tus invitados podrán confirmar desde la invitación y tú podrás consultar sus respuestas.</p>
              </div>
            )}
            <div className="mt-4">
              <FieldLabel required>Máximo de personas por confirmación</FieldLabel>
              <div className="flex max-w-xs items-center gap-3 rounded-xl border border-[#DDD3C5] bg-white p-2">
                <button type="button" aria-label="Restar una persona" onClick={() => updateForm("maxPartySize", String(Math.max(1, Number(form.maxPartySize) - 1)))} disabled={Number(form.maxPartySize) <= 1} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E8DED0] text-[#51483E] transition hover:bg-[#F8F1E5] disabled:cursor-not-allowed disabled:opacity-35"><Minus size={17} /></button>
                <input aria-label="Máximo de personas por confirmación" type="number" inputMode="numeric" min={1} max={20} step={1} value={form.maxPartySize} onChange={(event) => updateForm("maxPartySize", String(Math.min(20, Math.max(1, Math.trunc(Number(event.target.value) || 1)))))} required className="min-w-0 flex-1 border-0 bg-transparent text-center text-lg font-semibold tabular-nums text-[#302B27] outline-none focus:ring-0" />
                <button type="button" aria-label="Sumar una persona" onClick={() => updateForm("maxPartySize", String(Math.min(20, Number(form.maxPartySize) + 1)))} disabled={Number(form.maxPartySize) >= 20} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E8DED0] text-[#51483E] transition hover:bg-[#F8F1E5] disabled:cursor-not-allowed disabled:opacity-35"><Plus size={17} /></button>
              </div>
              <span className="mt-1.5 block text-xs leading-5 text-[#62594F]">Incluye al invitado y sus acompañantes. Puedes elegir de 1 a 20 personas.</span>
            </div>
          </Section>

          <Section number="6" title="Foto y sugerencia de color" description="Selecciona una foto vertical y, si lo deseas, una preferencia de color para orientar el diseño." icon={<Palette size={20} />}>
            <div className="rounded-2xl border border-[#E8DED0] bg-white p-4 sm:p-5">
              <p className="text-sm font-semibold text-[#302B27]">Diseño prediseñado sugerido</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-20 w-16 shrink-0 flex-col justify-end gap-1 overflow-hidden rounded-lg border border-[#DED1BE] p-2" style={{ backgroundColor: getSuggestedTemplate(form.eventType).colors[0] }}>
                  <span className="block h-2 rounded-sm" style={{ backgroundColor: getSuggestedTemplate(form.eventType).colors[2] }} />
                  <span className="block h-1.5 w-2/3 rounded-sm" style={{ backgroundColor: getSuggestedTemplate(form.eventType).colors[1] }} />
                  <span className="block h-1 w-1/2 rounded-sm" style={{ backgroundColor: getSuggestedTemplate(form.eventType).colors[2] }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#302B27]">{getSuggestedTemplate(form.eventType).label}</p>
                  <p className="mt-1 text-sm leading-5 text-[#62594F]">{getSuggestedTemplate(form.eventType).description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-[#CDBB9D] bg-[#FBF7F0] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-48 w-full max-w-[150px] shrink-0 items-center justify-center self-center overflow-hidden rounded-xl border border-[#DED1BE] bg-white sm:self-start">
                  {coverPreview ? <img src={coverPreview} alt="Vista previa de la foto vertical seleccionada" className="h-full w-full object-cover" /> : <div className="px-3 text-center text-xs leading-5 text-[#71675D]"><Camera size={28} className="mx-auto mb-2 text-[#8B6C42]" />Vista previa de portada vertical</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <FieldLabel required>Foto de portada vertical</FieldLabel>
                  <p className="mb-3 text-sm leading-6 text-[#62594F]">Selecciona una foto nítida, más alta que ancha. Recomendamos una proporción aproximada de 4:5.</p>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="sr-only" aria-label="Seleccionar foto de portada" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#34465D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25364B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34465D] focus-visible:ring-offset-2"><Upload size={16} /> {coverFile ? "Cambiar foto" : "Seleccionar foto"}</button>
                  {coverFile && <p className="mt-2 break-all text-xs font-medium text-[#3A6946]">Foto lista para subir.</p>}
                  <p className="mt-2 text-xs leading-5 text-[#62594F]">Formatos permitidos: JPG, PNG o WebP. Máximo 10 MB.</p>
                  {coverError && <p role="alert" className="mt-2 text-sm font-medium text-[#A33F35]">{coverError}</p>}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-[#3B342E]">Sugerencia de color <span className="ml-2 text-xs font-normal text-[#71675D]">Opcional</span></p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {getColorOptions(form.eventType).map((option) => {
                  const selected = form.colorPreference === option.value;
                  const swatches = option.colors;
                  return <label key={option.value} className={"flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition " + (selected ? "border-[#967544] bg-[#F8F1E5] ring-1 ring-[#967544]/20" : "border-[#E8DED0] bg-white hover:border-[#CBB797]")}>
                    <input type="radio" name="colorPreference" value={option.value} checked={selected} onChange={() => updateForm("colorPreference", option.value)} className="mt-1 h-4 w-4 shrink-0 accent-[#8B6C42]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#302B27]">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#62594F]">{option.description}</span>
                      <span className="mt-2 flex gap-1.5" aria-hidden="true">{swatches.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}</span>
                    </span>
                  </label>;
                })}
              </div>
              <p className="mt-3 rounded-xl bg-[#F8F5EF] p-3 text-xs leading-5 text-[#62594F]">La paleta elegida orienta los colores del diseño; se conserva la estructura de la plantilla seleccionada.</p>
            </div>
          </Section>

          {formError && <div role="alert" className="rounded-xl border border-[#E5B7AE] bg-[#FFF5F3] px-4 py-3 text-sm font-medium leading-6 text-[#8D3028]">{formError}</div>}

          <div className="rounded-2xl border border-[#DCCBB2] bg-[#FFFEFC] p-4 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1E8DB] text-[#765B38]"><ShieldCheck size={20} /></span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#302B27]">Revisa tus datos antes de enviarlos</h2>
                <p className="mt-1 text-sm leading-6 text-[#62594F]">Al continuar, se abrirá WhatsApp de Melissarte con el resumen listo. La solicitud no se envía hasta que pulses el botón de enviar dentro de WhatsApp.</p>
              </div>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="website-verification">No llenar este campo</label>
              <input
                id="website-verification"
                name="website-verification"
                type="text"
                value={honeypotValue}
                onChange={(event) => setHoneypotValue(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <button type="submit" disabled={preparingMessage} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#237544] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1B6238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#237544] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65 sm:w-auto"><MessageCircle size={18} /> {preparingMessage ? "Subiendo foto y preparando WhatsApp..." : "Enviar solicitud por WhatsApp"}</button>
            <p className="mt-3 text-xs leading-5 text-[#62594F]">Se subirá la foto para generar un enlace que se incluirá en el mensaje.</p>
          </div>
        </form>

        {requestText && <section id="solicitud-preparada" aria-live="polite" className="mt-5 scroll-mt-5 rounded-2xl border border-[#C8DEC9] bg-[#F6FAF5] p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F1E4] text-[#237544]"><CheckCircle2 size={20} /></span>
            <div className="min-w-0 flex-1"><h2 className="text-lg font-semibold text-[#294E35]">Tu mensaje está preparado</h2><p className="mt-1 text-sm leading-6 text-[#4E5E50]">Si WhatsApp no se abrió automáticamente, usa el botón para abrirlo. Revisa el resumen y confirma que el enlace de la foto esté incluido antes de enviar el mensaje.</p></div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#237544] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B6238]"><MessageCircle size={16} /> Abrir WhatsApp</a>
            <button type="button" onClick={() => void copyRequest()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C8DEC9] bg-white px-4 py-2.5 text-sm font-semibold text-[#294E35] transition hover:bg-[#EEF6EE]"><Copy size={16} /> Copiar respuestas</button>
            <button type="button" onClick={downloadRequest} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C8DEC9] bg-white px-4 py-2.5 text-sm font-semibold text-[#294E35] transition hover:bg-[#EEF6EE]"><Download size={16} /> Descargar .txt</button>
          </div>
          <details className="mt-4 rounded-xl border border-[#D8E8D8] bg-white p-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#294E35]">Ver el mensaje que se enviará</summary>
            <textarea readOnly value={requestText} rows={12} className="mt-3 w-full rounded-lg border border-[#DDD3C5] bg-[#FFFEFC] p-3 text-xs leading-5 text-[#302B27]" />
          </details>
          <p className="mt-4 text-xs leading-5 text-[#4E5E50]">Importante: abrir WhatsApp no envía el mensaje automáticamente. Revisa los datos y pulsa enviar dentro del chat para completar tu solicitud.</p>
        </section>}

        <footer className="mt-6 flex flex-col items-center gap-2 pb-4 text-center text-xs leading-5 text-[#71675D]">
          <span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> Melissarte · Invitaciones digitales</span>
          <span>Gracias por compartir los detalles de tu celebración.</span>
        </footer>
      </div>
    </main>
  );
}
