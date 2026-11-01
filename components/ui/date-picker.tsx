"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromIso = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

export default function DatePicker({ value, onChange, min, disabled = false, required = false, className = "", placeholder = "Seleccionar fecha", ariaLabel = "Seleccionar fecha" }: Props) {
  const selected = fromIso(value);
  const minimum = fromIso(min ?? "");
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const initial = selected ?? today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [month]);

  const display = selected
    ? selected.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
    : "";

  function changeMonth(amount: number) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  return (
    <div className={`relative ${className}`}>
      <button type="button" disabled={disabled} aria-required={required} aria-label={ariaLabel} aria-expanded={open} aria-haspopup="dialog" onClick={() => { if (!open) setMonth(new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1)); setOpen(current => !current); }}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#E7DCC8] bg-[#FFFEFC] px-4 py-3 text-left text-base font-normal text-[#332B27] outline-none transition hover:border-[#B8955B] focus-visible:ring-2 focus-visible:ring-[#B8955B]/20 disabled:bg-[#F4F1EC] disabled:text-[#8A8074]">
        <span className={display ? "" : "text-[#8A8074]"}>{display || placeholder}</span>
        <CalendarDays size={18} className="shrink-0 text-[#967443]" />
      </button>
      {open && !disabled && (
        <div role="dialog" aria-label="Calendario" className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-[#E7DCC8] bg-white p-3 shadow-xl sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button type="button" aria-label="Mes anterior" onClick={() => changeMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEE7DC] text-[#51483E] hover:bg-[#F8F5EF]"><ChevronLeft size={17}/></button>
            <p className="text-sm font-semibold capitalize text-[#332B27]">{month.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</p>
            <button type="button" aria-label="Mes siguiente" onClick={() => changeMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEE7DC] text-[#51483E] hover:bg-[#F8F5EF]"><ChevronRight size={17}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span key={`${day}-${index}`} className="py-1 text-[11px] font-semibold text-[#8A8074]">{day}</span>)}
            {days.map((day, index) => {
              if (day === null) return <span key={`empty-${index}`} />;
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const iso = toIso(date);
              const isSelected = value === iso;
              const isDisabled = Boolean(minimum && date < new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate()));
              const isToday = toIso(today) === iso;
              return <button key={iso} type="button" disabled={isDisabled} aria-pressed={isSelected} onClick={() => { onChange(iso); setOpen(false); }}
                className={`min-h-10 rounded-lg text-sm transition ${isSelected ? "bg-[#263D4B] font-semibold text-white" : isToday ? "border border-[#B8955B] text-[#806747]" : "text-[#51483E] hover:bg-[#F8F5EF]"} disabled:cursor-not-allowed disabled:opacity-25`}>{day}</button>;
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-[#EEE7DC] pt-3">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="rounded-full px-3 py-2 text-xs text-[#7D7467]">Limpiar</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-[#F8F5EF] px-4 py-2 text-xs font-semibold text-[#51483E]">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
