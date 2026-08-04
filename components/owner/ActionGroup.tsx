import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface Action {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface Props {
  actions: Action[];
}

export default function ActionGroup({
  actions,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7DCC8] bg-[#FDFBF8] shadow-sm">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`
            flex w-full items-center justify-between
            px-6 py-6 text-left transition-all duration-200
            ${
              action.disabled
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-[#FCF8F3]"
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 text-[#7D7467]">
              {action.icon}
            </div>

            <div>
              <p className="text-lg font-semibold text-[#1F1F1F]">
                {action.title}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-[#7D7467]">
                {action.description}
              </p>
            </div>
          </div>

          <ChevronRight
            size={22}
            className="text-[#B8AD9D]"
          />

          {index !== actions.length - 1 && (
            <div className="absolute bottom-0 left-6 right-6 h-px bg-[#E7DCC8]" />
          )}
        </button>
      ))}
    </div>
  );
}