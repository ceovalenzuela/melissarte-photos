import {
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "single" | "top" | "middle" | "last";
}

export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  disabled = false,
loading = false,
variant = "single",
}: Props) {
  const roundedClass = {
  single: "rounded-3xl",
  top: "",
  middle: "",
  last: "",
}[variant];

  const borderClass = {
  single: "border",
  top: "border-b",
  middle: "border-b",
  last: "",
}[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group flex min-h-[150px] w-full flex-col justify-between rounded-2xl
        border border-[#E7DCC8] bg-[#FDFBF8] p-5 text-left
        shadow-[0_8px_28px_rgba(53,44,34,0.05)]
        transition-all duration-200
        ${
          loading
            ? "cursor-progress bg-[#F5EFE6]"
            : disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:-translate-y-0.5 hover:border-[#D8C8AE] hover:bg-[#FFFCF8] hover:shadow-[0_12px_32px_rgba(53,44,34,0.08)]"
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3ECE2] text-[#A88249]">
          {loading ? (
            <LoaderCircle size={20} className="animate-spin [animation-duration:1.5s]" />
          ) : (
            icon
          )}
        </div>

        {!loading && (
          <ChevronRight
            size={18}
            className="mt-1 text-[#B8AD9D] transition-transform duration-200 group-hover:translate-x-1"
          />
        )}
      </div>

      <div className="mt-6">
        <p className="text-base font-semibold text-[#1F1F1F]">{title}</p>
        <p className="mt-1.5 text-xs leading-5 text-[#7D7467]">{description}</p>
      </div>
    </button>
  );
}