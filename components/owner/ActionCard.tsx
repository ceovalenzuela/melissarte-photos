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
        w-full rounded-2xl border p-6 text-left transition
        ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-neutral-50"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-neutral-700">
            {icon}
          </div>

          <div>
            <p className="text-lg font-semibold">
              {title}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              {description}
            </p>
          </div>
        </div>

        <span className="text-xl text-neutral-400">
          <ChevronRight />
        </span>
      </div>
    </button>
  );
}