import { useState, useEffect } from "react";
import type { ComplaintStatus, Priority } from "../../../data/dashboard.data";
import {
  EditIcon,
  EyeIcon,
  TrashIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import Card from "../../../ui/Card";
import ConfirmPopup from "../../../ui/ConfirmPopup";
import ComplaintFormModal, {
  type ComplaintFormValues,
} from "../../../components/modals/ComplaintFormModal";
import ComplaintViewModal, {
  type ComplaintViewData,
} from "../../../components/modals/ComplaintViewModal";
import { cn } from "../../../lib/cn";

type ComplaintRow = {
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
  initials: string;
  description?: string;
  wing?: string;
  unit?: string;
};

type ComplaintTableProps = {
  data: ComplaintRow[];
  role?: string | null;
};

const priorityClasses: Record<Priority, string> = {
  Medium: "bg-[#5678E9] text-white",
  Low: "bg-[#39973D] text-white",
  High: "bg-[#E74C3C] text-white",
};

const statusClasses: Record<ComplaintStatus, string> = {
  Open: "bg-[#5678E93A] text-[#5678E9]",
  Pending: "bg-[#FFC3131A] text-[#FFC313]",
  Solve: "bg-[#39973D1A] text-[#39973D]",
};

const defaultDescription =
  "Offering, giving, receiving, or soliciting of value to influence the actions of an.";

const editDescription =
  "The celebration of Ganesh Chaturthi involves the installation of clay idols of Ganesa in Resident.";

function Badge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[31px] min-w-[78px] items-center justify-center rounded-full px-4 text-xs font-medium leading-none",
        className
      )}
    >
      {children}
    </span>
  );
}

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

export default function ComplaintTable({ data, role }: ComplaintTableProps) {
  const [rows, setRows] = useState<ComplaintRow[]>(data);

  // Sync rows with data prop when it changes
  useEffect(() => {
    setRows(data);
  }, [data]);

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintViewData | null>(null);

  const [editingComplaint, setEditingComplaint] = useState<ComplaintRow | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ComplaintRow | null>(null);

  const isResident = role === "resident";

  const openViewModal = (row: ComplaintRow) => {
    setSelectedComplaint({
      ...row,
      description: row.description ?? defaultDescription,
      wing: row.wing ?? "A",
      unit: row.unit ?? "1002",
    });
  };

  const closeViewModal = () => {
    setSelectedComplaint(null);
  };

  const openEditModal = (row: ComplaintRow) => {
    setEditingComplaint({
      ...row,
      description: row.description ?? editDescription,
      wing: row.wing ?? "A",
      unit: row.unit ?? "1001",
    });
  };

  const closeEditModal = () => {
    setEditingComplaint(null);
  };

  const openDeleteModal = (row: ComplaintRow) => {
    setDeleteTarget(row);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleSaveComplaint = (values: ComplaintFormValues) => {
    if (!editingComplaint) return;

    setRows((current) =>
      current.map((item) =>
        item.id === editingComplaint.id
          ? {
            ...item,
            complainerName: values.complainerName,
            complaintName: values.complaintName,
            description: values.description,
            wing: values.wing,
            unit: values.unit,
            priority: values.priority,
            status: values.status,
          }
          : item
      )
    );

    closeEditModal();
  };

  const handleDeleteComplaint = () => {
    if (!deleteTarget) return;

    setRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    closeDeleteModal();
  };

  return (
    <>
      <Card className="flex min-h-[360px] flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold leading-5 text-[#202224]">
            Complaint List
          </h2>

          <button
            type="button"
            className="flex min-h-9 items-center gap-2 rounded-[10px] border border-[#D3D3D3] bg-white px-3.5 text-xs font-semibold text-[#202224] transition hover:bg-[#F6F8FB]"
          >
            Month <span className="text-[11px] leading-none">⌄</span>
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[10px]">
          <div className="max-h-[286px] overflow-auto pr-1">
            <table className="w-full min-w-[830px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F0F3FF]">
                  {[
                    "Complainer Name",
                    "Complaint Name",
                    "Date",
                    "Priority",
                    "Complain Status",
                    "Action",
                  ].map((heading, index, arr) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-4 py-4 text-left text-xs font-semibold text-[#202224] first:rounded-l-[10px] last:rounded-r-[10px]",
                        index === arr.length - 1 && "text-center"
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F1F1F1] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-[30px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#FFF1E9] text-[11px] font-semibold text-[#FE512E]">
                          {row.initials ? (
                            row.initials
                          ) : (
                            (row.complainerName || "C").charAt(0)
                          )}
                        </div>

                        <span className="whitespace-nowrap text-xs font-medium text-[#202224]">
                          {row.complainerName}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-[#202224]">
                      {row.complaintName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-[#202224]">
                      {row.date}
                    </td>

                    <td className="px-4 py-3">
                      <Badge className={priorityClasses[row.priority]}>
                        {row.priority}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge className={statusClasses[row.status]}>
                        {row.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {!isResident && (
                          <ActionButton
                            label="Edit complaint"
                            onClick={() => openEditModal(row)}
                          >
                            <EditIcon />
                          </ActionButton>
                        )}

                        <ActionButton
                          label="View complaint"
                          onClick={() => openViewModal(row)}
                        >
                          <EyeIcon />
                        </ActionButton>

                        {!isResident && (
                          <ActionButton
                            label="Delete complaint"
                            onClick={() => openDeleteModal(row)}
                          >
                            <TrashIcon />
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <ComplaintViewModal
        open={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        onClose={closeViewModal}
      />

      <ComplaintFormModal
        open={Boolean(editingComplaint)}
        mode="edit"
        initialValues={
          editingComplaint
            ? {
              complainerName: editingComplaint.complainerName,
              complaintName: editingComplaint.complaintName,
              description: editingComplaint.description ?? editDescription,
              wing: editingComplaint.wing ?? "A",
              unit: editingComplaint.unit ?? "1001",
              priority: editingComplaint.priority,
              status: editingComplaint.status,
            }
            : undefined
        }
        onClose={closeEditModal}
        onSave={handleSaveComplaint}
      />

      <ConfirmPopup
        open={Boolean(deleteTarget)}
        title="Delete Complain?"
        message="Are you sure you want to delete this complain?"
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteComplaint}
      />
    </>
  );
}