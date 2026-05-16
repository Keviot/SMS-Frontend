import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  maxWidth?: string;
  overflowVisible?: boolean;
};

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
  maxWidth = "max-w-2xl",
  overflowVisible = false,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div
        className={cn(
          "relative max-h-[90vh] w-full rounded-2xl bg-white p-6 shadow-2xl",
          maxWidth,
          overflowVisible ? "overflow-visible" : "overflow-y-auto",
          className
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-[#202224]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F6FA] text-[#6F7786] transition hover:bg-[#FFEDE6] hover:text-[#FF5630]"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}