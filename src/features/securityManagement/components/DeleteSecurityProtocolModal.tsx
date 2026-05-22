import Button from "../../../ui/Button";
import AppModal from "../../../components/modals/AppModal";

type DeleteSecurityProtocolModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteSecurityProtocolModal({
  open,
  onClose,
  onConfirm,
}: DeleteSecurityProtocolModalProps) {
  if (!open) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Delete Protocol?"
      widthClassName="w-full max-w-md"
      showHeaderDivider
    >

        <p className="mt-5 text-sm font-normal leading-5 text-[#A7A7A7]">
          Are you sure you want to delete this Protocol?
        </p>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-h-12 rounded-xl border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
            className="min-h-12 rounded-xl bg-[#E74C3C] text-base font-semibold text-white hover:bg-[#C0392B]"
          >
            Delete
          </Button>
        </div>
    </AppModal>
  );
}