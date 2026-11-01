"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");
const toKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromKey = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

export default function DatePicker({ label, value, onChange, min, disabled = false, required = false, placeholder = "Seleccionar fecha" }: Props) {
  const selected = fromKey(value);
  const minimum = fromKey(min ?? "");
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = selected ?? minimum ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(visibleMonth);
  const days = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [visibleMonth]);
  const displayValue = selected ? new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(selected) : "";

  function moveMonth(delta: number) {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div className="relative">
      {label && <label className="mb-1.5 block text-sm font-medium text-[#4E463D]">{label}{required && <span className="ml-1 text-[#A35B4D]">*</span>}</label>}
      <button type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (!open) { const base = selected ?? minimum ?? new Date(); setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1)); } setOpen(v => !v); }}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-left text-sm text-[#332B27] outline-none transition hover:border-[#B8955B] focus-visible:ring-2 focus-visible:ring-[#B8955B]/25 disabled:bg-[#F4F1EC] disabled:text-[#8A8074]">
        <span className={displayValue ? "" : "text-[#8A8074]"}>{displayValue || placeholder}</span><CalendarDays size={17} className="shrink-0 text-[#9A8060]" />
      </button>
      {open && !disabled && <div onClick={() => setOpen(false)} className="fixed inset-0 z-[100] flex items-end justify-center bg-black/25 p-3 sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:block sm:bg-transparent sm:p-0"><div role="dialog" aria-modal="true" aria-label="Seleccionar fecha" onClick={(event) => event.stopPropagation()} className="max-h-[85vh] max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#E7DCC8] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:max-h-none sm:overflow-visible sm:p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F7F3EC]"><ChevronLeft size={18}/></button>
          <p className="text-sm font-semibold capitalize text-[#332B27]">{monthLabel}</p>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F7F3EC]"><ChevronRight size={18}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["L","M","M","J","V","S","D"].map((day, i) => <span key={i} className="py-1 text-[11px] font-semibold text-[#8A8074]">{day}</span>)}
          {days.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />;
            const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
            const key = toKey(date);
            const isDisabled = Boolean(minimum && key < toKey(minimum));
            const active = value === key;
            return <button key={key} type="button" disabled={isDisabled} aria-pressed={active} onClick={() => { onChange(key); setOpen(false); }}
              className={`min-h-10 rounded-lg text-sm transition ${active ? "bg-[#263D4B] font-semibold text-white" : isDisabled ? "text-[#D2CBC0]" : "text-[#40392F] hover:bg-[#F5F0E7]"}`}>{day}</button>;
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#F0E9DF] pt-2">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="px-2 py-2 text-xs text-[#7D7467]">Limpiar</button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-xs font-semibold text-[#806747]">Cerrar</button>
        </div>
      </div></div>}
    </div>
  );
}
