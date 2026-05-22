import Button from "../../../ui/Button";
import AppModal from "../../../components/modals/AppModal";

interface DeleteConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
}

export default function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message = "Are you sure you want to delete this?",
}: DeleteConfirmModalProps) {
    if (!open) return null;

    return (
        <AppModal
            open={open}
            onClose={onClose}
            title={title}
            widthClassName="w-full max-w-[410px]"
            showHeaderDivider
        >

                <p className="mt-5 text-sm font-normal leading-5 text-[#4F4F4F]">
                    {message}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-5">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="h-12 rounded-xl border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        className="h-12 rounded-xl bg-[#E74C3C] text-base font-semibold text-white hover:bg-[#C0392B]"
                    >
                        Delete
                    </Button>
                </div>
        </AppModal>
    );
}
