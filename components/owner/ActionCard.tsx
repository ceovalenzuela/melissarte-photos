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
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        flex
        min-h-[96px]
        w-full
        items-center
        gap-3
        rounded-2xl
        border
        border-[#D8C7A8]
        bg-[#F7F1E7]
        px-4
        py-3.5
        text-left
        shadow-[0_6px_20px_rgba(74,60,42,0.06)]
        transition-all
        duration-200
        ${
          loading
            ? "cursor-progress bg-[#F3EBDD]"
            : disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:-translate-y-0.5 hover:border-[#CDB990] hover:bg-[#F3EBDD] hover:shadow-[0_10px_24px_rgba(74,60,42,0.08)]"
        }
      `}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A88249] text-white shadow-sm">
        {loading ? (
          <LoaderCircle
            size={18}
            className="animate-spin [animation-duration:1.5s]"
          />
        ) : (
          icon
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#2F2A24]">{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-[#746B60]">
          {description}
        </p>
      </div>

      {!loading && (
        <ChevronRight
          size={17}
          className="ml-auto shrink-0 text-[#8B6D3B] transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}
