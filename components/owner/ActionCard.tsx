import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        rounded-3xl
        border
        border-[#E7DCC8]
        bg-[#FDFBF8]
        p-6
        text-left
        shadow-sm
        transition-all
        duration-200

        ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-[#FCF8F3] hover:shadow-md"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-[#7D7467]">
            {icon}
          </div>

          <div>
            <p className="text-lg font-semibold text-[#1F1F1F]">
              {title}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#7D7467]">
              {description}
            </p>
          </div>
        </div>

        <ChevronRight
          size={22}
          className="text-[#B8AD9D]"
        />
      </div>
    </button>
  );
}