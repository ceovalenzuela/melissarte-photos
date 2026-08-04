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
  variant?: "single" | "top" | "middle" | "bottom";
}

export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  variant = "single",
}: Props) {
  const roundedClass = {
    single: "rounded-3xl",
    top: "",
    middle: "",
    bottom: "",
  }[variant];

  const borderClass = {
    single: "border",
    top: "border-b",
    middle: "border-b",
    bottom: "",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        w-full
        ${roundedClass}
        ${borderClass}
        border-[#E7DCC8]
        bg-[#FDFBF8]
        px-7 py-7
        text-left
        transition-colors
        duration-200

        ${
          disabled
  ? "cursor-not-allowed bg-[#F8F4EE]"
            : "hover:bg-[#FCF8F3]"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-[#7D7467]">
  {icon}
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

        {disabled ? (
  <LoaderCircle
    size={22}
    className="animate-spin text-[#B08D57]"
  />
) : (
  <ChevronRight
    size={22}
    className="text-[#B8AD9D] transition-transform duration-200 group-hover:translate-x-1"
  />
)}
      </div>
    </button>
  );
}