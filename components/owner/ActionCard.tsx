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
        ${!loading && !disabled ? "group" : ""}
        w-full
        ${roundedClass}
        ${borderClass}
        border-[#E7DCC8]
        bg-[#FDFBF8]
        px-7
        py-6
        text-left
        transition-colors
        duration-200

        ${
  loading
    ? "cursor-progress bg-[#F5EFE6]"
    : disabled
      ? "cursor-not-allowed opacity-60"
      : "hover:bg-[#FCF8F3]"
}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
            {loading ? (
              <LoaderCircle
                size={22}
                className="animate-spin text-[#A88249] [animation-duration:1.5s]"
              />
            ) : (
              <div className="text-[#A88249]">
                {icon}
              </div>
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-[#1F1F1F]">
              {title}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#7D7467]">
              {description}
            </p>
          </div>
        </div>

        {!loading && (
          <ChevronRight
            size={22}
            className="text-[#B8AD9D] transition-transform duration-200 group-hover:translate-x-1"
          />
        )}
      </div>
    </button>
  );
}