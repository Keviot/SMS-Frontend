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
      widthClassName="w-[410px]"
      panelClassName="!h-[192px]"
      showHeaderDivider
    >
      <div className="mt-[20px] h-[20px] w-full">
        <p className="text-[12px] font-normal leading-[15px] text-[#A7A7A7]">
          {message}
        </p>
      </div>

      <div className="mt-[20px] grid h-[51px] grid-cols-2 gap-[20px]">
        <button
          type="button"
          onClick={onCancel}
          className="h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white text-[14px] font-medium leading-[17px] text-[#202224]"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="h-[51px] rounded-[10px] bg-[#E74C3C] text-[14px] font-semibold leading-[17px] text-white"
        >
          {confirmText}
        </button>
      </div>
    </AppModal>
  );
}