import Button from "../../../ui/Button";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
        <div className="border-b border-[#E5E7EB] pb-4">
          <h2 className="text-xl font-bold leading-6 text-[#202224]">
            Delete Protocol?
          </h2>
        </div>

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
      </div>
    </div>
  );
}