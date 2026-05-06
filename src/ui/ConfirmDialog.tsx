import Button from "./Button";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  danger = true,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose} className="max-w-sm">
      <p className="text-sm font-semibold leading-6 text-[#6F7786]">
        {description}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>

        <Button
          type="button"
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}