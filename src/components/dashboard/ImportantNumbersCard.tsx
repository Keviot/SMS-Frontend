import { useState } from "react";
import {
  AddSquareIcon,
  EditIcon,
  TrashIcon,
} from "../../icons/admin-dashboard-icons";
import Card from "../../ui/Card";
import ConfirmPopup from "../../ui/ConfirmPopup";
import ImportantNumberFormModal, {
  type ImportantNumberFormValues,
} from "./popups/ImportantNumberFormModal";

type ImportantNumber = {
  id: string;
  name: string;
  phone: string;
  work: string;
};

type ImportantNumbersCardProps = {
  data: ImportantNumber[];
};

function ActionButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-[30px] w-[30px] place-items-center rounded-[6px] bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:h-[17px] [&_svg]:w-[17px]"
    >
      {children}
    </button>
  );
}

export default function ImportantNumbersCard({
  data,
}: ImportantNumbersCardProps) {
  const [numbers, setNumbers] = useState<ImportantNumber[]>(data);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<ImportantNumber | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ImportantNumber | null>(null);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedNumber(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: ImportantNumber) => {
    setModalMode("edit");
    setSelectedNumber(item);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedNumber(null);
  };

  const openDeleteModal = (item: ImportantNumber) => {
    setDeleteTarget(item);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleSave = (values: ImportantNumberFormValues) => {
    if (modalMode === "edit" && selectedNumber) {
      setNumbers((current) =>
        current.map((item) =>
          item.id === selectedNumber.id
            ? {
                ...item,
                ...values,
              }
            : item
        )
      );
    } else {
      setNumbers((current) => [
        {
          id: crypto.randomUUID(),
          ...values,
        },
        ...current,
      ]);
    }

    closeFormModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    setNumbers((current) =>
      current.filter((item) => item.id !== deleteTarget.id)
    );

    closeDeleteModal();
  };

  return (
    <>
      <Card className="h-[398px] p-[16px]">
        <div className="flex items-center justify-between gap-[10px]">
          <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">
            Important Numbers
          </h2>

          <button
            type="button"
            onClick={openAddModal}
            className="flex h-[43px] w-[84px] items-center gap-[8px] rounded-[5px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-[9px] text-[12px] font-medium text-white"
          >
            <AddSquareIcon className="h-[20px] w-[20px]" />
            Add
          </button>
        </div>

        <div className="mt-[15px] h-[320px] space-y-[11px] overflow-y-auto pr-[4px]">
          {numbers.map((item) => (
            <div
              key={item.id}
              className="flex min-h-[75px] justify-between gap-[10px] rounded-[10px] border border-[#F1F1F1] bg-white p-[10px]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium leading-[18px] text-[#202224]">
                  <span className="font-semibold">Name :</span>{" "}
                  <span className="text-[#4F4F4F]">{item.name}</span>
                </p>

                <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                  Ph Number :{" "}
                  <span className="text-[#4F4F4F]">{item.phone}</span>
                </p>

                <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                  Work : <span className="text-[#4F4F4F]">{item.work}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-start gap-[6px]">
                <ActionButton
                  label="Delete important number"
                  onClick={() => openDeleteModal(item)}
                >
                  <TrashIcon />
                </ActionButton>

                <ActionButton
                  label="Edit important number"
                  onClick={() => openEditModal(item)}
                >
                  <EditIcon />
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ImportantNumberFormModal
        open={isFormOpen}
        mode={modalMode}
        initialValues={
          selectedNumber
            ? {
                name: selectedNumber.name,
                phone: selectedNumber.phone,
                work: selectedNumber.work,
              }
            : undefined
        }
        onClose={closeFormModal}
        onSave={handleSave}
      />

      <ConfirmPopup
        open={Boolean(deleteTarget)}
        title="Delete Number?"
        message="Are you sure you want to delete this number?"
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </>
  );
}