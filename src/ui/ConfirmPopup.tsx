import AppModal from "../components/modals/AppModal";

type ConfirmPopupProps = {
  open: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmPopup({
  open,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Delete",
  onCancel,
  onConfirm,
}: ConfirmPopupProps) {
  return (
    <AppModal
      open={open}
      title={title}
      widthClassName="w-full max-w-[410px]"
      centerTitle
    >
      <div className="pt-2 pb-6 text-center">
        <p className="text-[14px] font-medium leading-relaxed text-gray-400">
          {message}
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-[16px] font-bold text-gray-700 transition hover:bg-gray-50"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-12 rounded-xl bg-[#E74C3C] text-[16px] font-bold text-white transition hover:bg-[#C0392B] shadow-lg shadow-red-500/10"
        >
          {confirmText}
        </button>
      </div>
    </AppModal>
  );
}