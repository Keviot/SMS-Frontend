type PopupActionsProps = {
  cancelText?: string;
  submitText?: string;
  disabled?: boolean;
  onCancel: () => void;
};

export default function PopupActions({
  cancelText = "Cancel",
  submitText = "Save",
  disabled = false,
  onCancel,
}: PopupActionsProps) {
  return (
    <div className="mt-[20px] grid h-[51px] grid-cols-2 gap-[20px]">
      <button
        type="button"
        onClick={onCancel}
        className="h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white text-[14px] font-medium leading-[17px] text-[#202224] transition hover:bg-[#F6F8FB]"
      >
        {cancelText}
      </button>

      <button
        type="submit"
        disabled={disabled}
        className="h-[51px] rounded-[10px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] text-[14px] font-semibold leading-[17px] text-white transition disabled:bg-none disabled:bg-[#F6F8FB] disabled:text-[#202224] disabled:opacity-100"
      >
        {submitText}
      </button>
    </div>
  );
}