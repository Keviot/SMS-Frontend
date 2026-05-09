import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

type AppModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  widthClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  showHeaderDivider?: boolean;
  headerRight?: ReactNode;
  titleClassName?: string;
  centerTitle?: boolean;
};

export default function AppModal({
  open,
  title,
  children,
  onClose,
  widthClassName = "max-w-[410px]",
  overlayClassName = "",
  panelClassName = "",
  showHeaderDivider = false,
  headerRight,
  titleClassName = "text-2xl font-bold leading-[22px] text-[#202224]",
  centerTitle = false,
}: AppModalProps) {
  if (!open) return null;

  const modalRoot = document.body;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4 transition-opacity",
        overlayClassName
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className={cn(
          "relative rounded-2xl bg-white p-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all animate-in fade-in zoom-in duration-200",
          widthClassName,
          panelClassName
        )}
      >
        <div
          className={cn(
            "relative flex w-full items-center mb-[20px]",
            centerTitle ? "justify-center" : "justify-between",
            showHeaderDivider && "border-b border-[#F4F4F4] pb-[15px]"
          )}
        >
          <h2 className={cn(titleClassName, centerTitle && "text-center")}>
            {title}
          </h2>

          <div className={cn("flex items-center gap-2", !centerTitle ? "" : "absolute right-0")}>
            {headerRight}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F8FB] text-[#202224] transition hover:bg-[#FFEDE6] hover:text-[#FF5630]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
}