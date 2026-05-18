import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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

const defaultDescription = "";

const editDescription = "";

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
        "inline-flex min-h-[31px] min-w-[100px] w-full h-full items-center justify-center rounded-full px-4 text-sm font-medium leading-none",
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
      className="grid size-[40px] place-items-center rounded-lg bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:size-[17px]"
    >
      {children}
    </button>
  );
}

export default function ComplaintTable({ data, role }: ComplaintTableProps) {
  const [rows, setRows] = useState<ComplaintRow[]>(data);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  // Sync rows with data prop when it changes
  useEffect(() => {
    setRows(data);
  }, [data]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
          <h2 className="text-xl font-semibold leading-5 text-[#202224]">
            Complaint List
          </h2>

          <div className="dropdown-container relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#D3D3D3] bg-white px-3.5 text-md font-semibold text-[#202224] transition hover:bg-[#F6F8FB]"
            >
              {selectedPeriod} <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-[10px] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                {["Last Week", "Last Month", "Last Year"].map((item) => {
                  const isActive = item === selectedPeriod || (item === "Last Month" && selectedPeriod === "Month");

                  return (
                    <label
                      key={item}
                      onClick={() => {
                        setSelectedPeriod(item);
                        setIsDropdownOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2.5 py-1.5"
                    >
                      <div
                        className={`grid size-4 place-items-center rounded-full border ${isActive ? "border-[#FE512E]" : "border-[#C9CDD5]"
                          }`}
                      >
                        {isActive && (
                          <div className="size-2 rounded-full bg-[#FE512E]" />
                        )}
                      </div>

                      <span
                        className={`text-xs font-medium ${isActive ? "text-[#202224]" : "text-[#A7A7A7]"
                          }`}
                      >
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
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
                        "px-4 py-4 text-left text-sm font-semibold text-[#202224] first:rounded-l-[10px] last:rounded-r-[10px]",
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

                        <span className="whitespace-nowrap text-md font-medium text-[#202224]">
                          {row.complainerName}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-md font-medium text-[#202224]">
                      {row.complaintName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-md font-medium text-[#202224]">
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
                            <EditIcon width={24} height={24} className="w-full h-full"/>
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