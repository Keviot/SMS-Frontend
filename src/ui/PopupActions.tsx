import { cn } from "../lib/cn";

type PopupActionsProps = {
  cancelText?: string;
  submitText?: string;
  disabled?: boolean;
  onCancel: () => void;
  className?: string;
  cancelClassName?: string;
  submitClassName?: string;
};

export default function PopupActions({
  cancelText = "Cancel",
  submitText = "Save",
  disabled = false,
  onCancel,
  className = "",
  cancelClassName = "",
  submitClassName = "",
}: PopupActionsProps) {
  return (
    <div className={cn("mt-5 grid grid-cols-2 gap-5", className)}>
      <button
        type="button"
        onClick={onCancel}
        className={cn(
          "min-h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white px-4 text-sm font-medium leading-[17px] text-[#202224] transition hover:bg-[#F6F8FB]",
          cancelClassName
        )}
      >
        {cancelText}
      </button>

      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "min-h-[51px] rounded-[10px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-4 text-sm font-semibold leading-[17px] text-white transition disabled:bg-none disabled:bg-[#F6F8FB] disabled:text-[#202224] disabled:opacity-100",
          submitClassName
        )}
      >
        {submitText}
      </button>
    </div>
  );
}