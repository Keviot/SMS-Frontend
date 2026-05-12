import { useState, useEffect } from "react";
import {
  AddSquareIcon,
  EditIcon,
  TrashIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import Card from "../../../ui/Card";
import ConfirmPopup from "../../../ui/ConfirmPopup";
import ImportantNumberFormModal, {
  type ImportantNumberFormValues,
} from "../../../components/modals/ImportantNumberFormModal";

type ImportantNumber = {
  id: string;
  name: string;
  phone: string;
  work: string;
};

type ImportantNumbersCardProps = {
  data: ImportantNumber[];
  role?: string | null;
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
      className="grid size-[30px] place-items-center rounded-md bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:size-[17px]"
    >
      {children}
    </button>
  );
}

export default function ImportantNumbersCard({
  data,
  role,
}: ImportantNumbersCardProps) {
  const [numbers, setNumbers] = useState<ImportantNumber[]>(data);

  useEffect(() => {
    setNumbers(data);
  }, [data]);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<ImportantNumber | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ImportantNumber | null>(null);

  const isResident = role === "resident";

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
      <Card className="flex min-h-[398px] flex-col p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold leading-5 text-[#202224]">
            Important Numbers
          </h2>

          {!isResident && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex min-h-[43px] items-center gap-2 rounded-[5px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-2.5 text-xs font-medium text-white shadow-[0_8px_18px_rgba(254,81,46,0.22)] transition hover:opacity-95"
            >
              <AddSquareIcon className="size-5 shrink-0" />
              Add
            </button>
          )}
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden">
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {numbers.map((item) => (
              <div
                key={item.id}
                className="flex min-h-[75px] justify-between gap-3 rounded-[10px] border border-[#F1F1F1] bg-white p-2.5 transition hover:border-[#EDF0F5] hover:shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium leading-[18px] text-[#202224]">
                    <span className="font-semibold">Name :</span>{" "}
                    <span className="text-[#4F4F4F]">{item.name}</span>
                  </p>

                  <p className="mt-1 truncate text-[11px] font-medium leading-4 text-[#A7A7A7]">
                    Ph Number :{" "}
                    <span className="text-[#4F4F4F]">{item.phone}</span>
                  </p>

                  <p className="mt-1 truncate text-[11px] font-medium leading-4 text-[#A7A7A7]">
                    Work : <span className="text-[#4F4F4F]">{item.work}</span>
                  </p>
                </div>

                {!isResident && (
                  <div className="flex shrink-0 items-start gap-1.5">
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
                )}
              </div>
            ))}
          </div>
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