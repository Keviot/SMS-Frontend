import { useState } from "react";
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

type ComplaintRow = {
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
  avatar?: string;
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
      className={`inline-flex h-[31px] min-w-[78px] items-center justify-center rounded-full px-[16px] text-[12px] font-medium leading-none ${className}`}
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
      className="grid h-[30px] w-[30px] place-items-center rounded-[6px] bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:h-[17px] [&_svg]:w-[17px]"
    >
      {children}
    </button>
  );
}

export default function ComplaintTable({ data, role }: ComplaintTableProps) {
  const [rows, setRows] = useState<ComplaintRow[]>(data);

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintViewData | null>(null);

  const [editingComplaint, setEditingComplaint] = useState<ComplaintRow | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ComplaintRow | null>(null);

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

    setRows((current) =>
      current.filter((item) => item.id !== deleteTarget.id)
    );

    closeDeleteModal();
  };

  return (
    <>
      <Card className="h-[361px] p-[20px]">
        <div className="flex items-center justify-between gap-[12px]">
          <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">
            Complaint List
          </h2>

          <button
            type="button"
            className="flex h-[36px] items-center gap-[8px] rounded-[10px] border border-[#D3D3D3] bg-white px-[14px] text-[12px] font-semibold text-[#202224]"
          >
            Month <span className="text-[11px]">⌄</span>
          </button>
        </div>

        <div className="mt-[15px] h-[286px] overflow-auto rounded-[10px]">
          <table className="w-full min-w-[830px] border-collapse">
            <thead className="sticky top-0 z-1">
              <tr className="h-[50px] bg-[#F0F3FF]">
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
                    className={`px-[18px] text-left text-[12px] font-semibold text-[#202224] ${index === 0 ? "rounded-l-[10px]" : ""
                      } ${index === arr.length - 1 ? "rounded-r-[10px]" : ""}`}
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
                  className="h-[58px] border-b border-[#F1F1F1] last:border-b-0"
                >
                  <td className="px-[18px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-full bg-[#FFF1E9] text-[11px] font-semibold text-[#FE512E]">
                        {row.avatar ? (
                          <img
                            src={row.avatar}
                            alt={row.complainerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          row.complainerName.charAt(0)
                        )}
                      </div>

                      <span className="whitespace-nowrap text-[12px] font-medium text-[#202224]">
                        {row.complainerName}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">
                    {row.complaintName}
                  </td>

                  <td className="whitespace-nowrap px-[18px] text-[12px] font-medium text-[#202224]">
                    {row.date}
                  </td>

                  <td className="px-[18px]">
                    <Badge className={priorityClasses[row.priority]}>
                      {row.priority}
                    </Badge>
                  </td>

                  <td className="px-[18px]">
                    <Badge className={statusClasses[row.status]}>
                      {row.status}
                    </Badge>
                  </td>

                  <td className="px-[18px]">
                    <div className="flex items-center gap-[8px]">
                      {role !== "resident" && (
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

                      {role !== "resident" && (
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