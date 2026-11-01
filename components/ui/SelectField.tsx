"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };
type Props = { label?: string; value: string; onChange: (value: string) => void; options: Option[]; placeholder?: string; disabled?: boolean; className?: string; ariaLabel?: string };

export default function SelectField({ label, value, onChange, options, placeholder = "Seleccionar...", disabled = false, className = "", ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);
  return <div className={`relative ${className}`}>
    {label && <span className="mb-1.5 block text-sm font-medium text-[#4E463D]">{label}</span>}
    <button type="button" disabled={disabled} aria-label={ariaLabel ?? label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 text-left text-sm text-[#332B27] outline-none transition hover:border-[#B8955B] focus-visible:ring-2 focus-visible:ring-[#B8955B]/25 disabled:bg-[#F4F1EC]">
      <span className={selected ? "" : "text-[#8A8074]"}>{selected?.label ?? placeholder}</span><ChevronDown size={17} className={`shrink-0 text-[#8A8074] transition ${open ? "rotate-180" : ""}`}/>
    </button>
    {open && !disabled && <><button type="button" aria-label="Cerrar opciones" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} /><div role="listbox" className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#E7DCC8] bg-white p-1.5 shadow-xl">
      {options.map(option => <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); }}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? "bg-[#F7F2E8] font-semibold text-[#6F5635]" : "text-[#40392F] hover:bg-[#F8F5EF]"}`}>
        {option.label}{value === option.value && <Check size={16}/>}
      </button>)}
    </div></>}
  </div>;
}
