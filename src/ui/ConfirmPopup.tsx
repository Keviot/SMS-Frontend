import AppModal from "./AppModal";

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
      showHeaderDivider
      centerTitle
    >
      <div className="mt-4 mb-8 text-center">
        <p className="text-[14px] font-medium leading-relaxed text-[#A7A7A7]">
          {message}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 rounded-xl border border-[#D3D3D3] bg-white text-[16px] font-bold text-[#202224] transition hover:bg-gray-50"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="h-12 rounded-xl bg-[#E74C3C] text-[16px] font-bold text-white transition hover:bg-[#C0392B] shadow-lg shadow-red-500/20"
        >
          {confirmText}
        </button>
      </div>
    </AppModal>
  );
}