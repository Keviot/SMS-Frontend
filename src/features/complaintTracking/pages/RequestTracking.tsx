import { useMemo, useState, type ReactNode } from "react";
import Button from "../../../ui/Button";
import {
  EditIcon,
  EyeIcon,
  TrashIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import {
  RequestFormModal,
  RequestViewModal,
  DeleteConfirmModal,
  type RequestFormData,
} from "../components";

type Priority = "Medium" | "Low" | "High";
type RequestStatus = "Pending" | "Open" | "Solve";

type RequestItem = {
  id: number;
  requesterName: string;
  avatar: string;
  requestName: string;
  description: string;
  requestDate: string;
  unitLetter: string;
  unitNumber: string;
  priority: Priority;
  status: RequestStatus;
};

const requests: RequestItem[] = [
  {
    id: 1,
    requesterName: "Evelyn Harper",
    avatar: "https://i.pravatar.cc/80?img=11",
    requestName: "Unethical Behavior",
    description: "Regular waste collection services.",
    requestDate: "10/02/2024",
    unitLetter: "A",
    unitNumber: "1001",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 2,
    requesterName: "Guy Hawkins",
    avatar: "https://i.pravatar.cc/80?img=13",
    requestName: "Preventive Measures",
    description: "Event and recreational activities.",
    requestDate: "11/02/2024",
    unitLetter: "B",
    unitNumber: "1002",
    priority: "Low",
    status: "Solve",
  },
  {
    id: 3,
    requesterName: "Robert Fox",
    avatar: "https://i.pravatar.cc/80?img=14",
    requestName: "Unethical Behavior",
    description: "Regular waste collection services.",
    requestDate: "12/02/2024",
    unitLetter: "C",
    unitNumber: "1003",
    priority: "High",
    status: "Open",
  },
  {
    id: 4,
    requesterName: "Jacob Jones",
    avatar: "https://i.pravatar.cc/80?img=15",
    requestName: "Preventive Measures",
    description: "Rack the fluctuations in spending.",
    requestDate: "13/02/2024",
    unitLetter: "D",
    unitNumber: "1004",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 5,
    requesterName: "Floyd Miles",
    avatar: "https://i.pravatar.cc/80?img=19",
    requestName: "Unethical Behavior",
    description: "Expenses will way sense for you.",
    requestDate: "14/02/2024",
    unitLetter: "E",
    unitNumber: "2001",
    priority: "Low",
    status: "Solve",
  },
  {
    id: 6,
    requesterName: "Devon Lane",
    avatar: "https://i.pravatar.cc/80?img=21",
    requestName: "Preventive Measures",
    description: "Providing information deliberately.",
    requestDate: "15/02/2024",
    unitLetter: "F",
    unitNumber: "2002",
    priority: "High",
    status: "Open",
  },
  {
    id: 7,
    requesterName: "Evelyn Harper",
    avatar: "https://i.pravatar.cc/80?img=11",
    requestName: "Unethical Behavior",
    description: "Expenses will way sense for you.",
    requestDate: "16/02/2024",
    unitLetter: "G",
    unitNumber: "2003",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 8,
    requesterName: "Arlene McCoy",
    avatar: "https://i.pravatar.cc/80?img=22",
    requestName: "Preventive Measures",
    description: "Regular waste collection services.",
    requestDate: "17/02/2024",
    unitLetter: "H",
    unitNumber: "2004",
    priority: "Low",
    status: "Solve",
  },
  {
    id: 9,
    requesterName: "Eleanor Pena",
    avatar: "https://i.pravatar.cc/80?img=23",
    requestName: "Unethical Behavior",
    description: "Event and recreational activities.",
    requestDate: "18/02/2024",
    unitLetter: "I",
    unitNumber: "3001",
    priority: "High",
    status: "Open",
  },
  {
    id: 10,
    requesterName: "Kathryn Murphy",
    avatar: "https://i.pravatar.cc/80?img=20",
    requestName: "Preventive Measures",
    description: "Rack the fluctuations in spending.",
    requestDate: "19/02/2024",
    unitLetter: "A",
    unitNumber: "3002",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 11,
    requesterName: "Jerome Bell",
    avatar: "https://i.pravatar.cc/80?img=24",
    requestName: "Unethical Behavior",
    description: "Expenses will way sense for you.",
    requestDate: "20/02/2024",
    unitLetter: "B",
    unitNumber: "3003",
    priority: "Low",
    status: "Solve",
  },
];

function priorityClass(priority: Priority) {
  switch (priority) {
    case "High":
      return "bg-[#E74C3C] text-white";
    case "Low":
      return "bg-[#39973D] text-white";
    case "Medium":
    default:
      return "bg-[#5678E9] text-white";
  }
}

function statusClass(status: RequestStatus) {
  switch (status) {
    case "Solve":
      return "bg-[#E5F4E8] text-[#39973D]";
    case "Open":
      return "bg-[#EEF2FF] text-[#5678E9]";
    case "Pending":
    default:
      return "bg-[#FFF7E6] text-[#F0A000]";
  }
}

function ActionButton({
  label,
  variant,
  children,
  onClick,
}: {
  label: string;
  variant: "edit" | "view" | "delete";
  children: ReactNode;
  onClick?: () => void;
}) {
  const variantClasses = {
    edit: "bg-[#E8F7EC] text-[#39973D]",
    view: "bg-[#EEF2FF] text-[#5678E9]",
    delete: "bg-[#FFF0F0] text-[#E74C3C]",
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] transition hover:scale-105 ${variantClasses[variant]}`}
    >
      <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
        {children}
      </span>
    </button>
  );
}

function UnitBadge({ letter, number }: { letter: string; number: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#F1F6FF] text-xs font-bold text-[#5678E9]">
        {letter}
      </span>
      <span className="font-medium text-[#202224]">{number}</span>
    </div>
  );
}

export default function RequestTracking() {
  const rows = useMemo(() => requests, []);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const handleCreateRequest = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowEditModal(true);
  };

  const handleView = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleDelete = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  const handleRequestSubmit = (data: RequestFormData) => {
    console.log("Create request:", data);
    // TODO: Add API call to create request
    setShowCreateModal(false);
  };

  const handleRequestUpdate = (data: RequestFormData) => {
    console.log("Update request:", data);
    // TODO: Add API call to update request
    setShowEditModal(false);
    setSelectedRequest(null);
  };

  const handleConfirmDelete = () => {
    console.log("Delete request:", selectedRequest);
    // TODO: Add API call to delete request
    setShowDeleteModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold leading-8 text-[#202224]">
          Create Complaint
        </h1>

        <Button
          type="button"
          onClick={handleCreateRequest}
          className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-5 text-sm font-semibold text-white shadow-none sm:w-auto"
        >
          Create Request
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white">
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-18rem)] min-w-[60rem] overflow-y-auto pr-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                <tr>
                  <th className="rounded-l-xl px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                    Requester Name
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                    Request Name
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                    Description
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                    Request Date
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                    Unit Number
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                    Priority
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                    Status
                  </th>
                  <th className="rounded-r-xl px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-[#EDF0F5] last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.avatar}
                          alt={request.requesterName}
                          className="size-10 shrink-0 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-[#434A57]">
                          {request.requesterName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                      {request.requestName}
                    </td>

                    <td className="max-w-md px-5 py-4">
                      <p className="truncate text-sm font-medium text-[#434A57]">
                        {request.description}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                      {request.requestDate}
                    </td>

                    <td className="px-5 py-4">
                      <UnitBadge
                        letter={request.unitLetter}
                        number={request.unitNumber}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${priorityClass(
                          request.priority
                        )}`}
                      >
                        {request.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <ActionButton
                          label="Edit request"
                          variant="edit"
                          onClick={() => handleEdit(request)}
                        >
                          <EditIcon />
                        </ActionButton>

                        <ActionButton
                          label="View request"
                          variant="view"
                          onClick={() => handleView(request)}
                        >
                          <EyeIcon />
                        </ActionButton>

                        <ActionButton
                          label="Delete request"
                          variant="delete"
                          onClick={() => handleDelete(request)}
                        >
                          <TrashIcon />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleRequestSubmit}
      />

      <RequestFormModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRequestUpdate}
        initialData={
          selectedRequest
            ? {
              requesterName: selectedRequest.requesterName,
              requestName: selectedRequest.requestName,
              requestDate: selectedRequest.requestDate,
              wing: selectedRequest.unitLetter,
              unit: selectedRequest.unitNumber,
              priority: selectedRequest.priority,
              status: selectedRequest.status,
            }
            : null
        }
        isEdit={true}
      />

      <RequestViewModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        data={
          selectedRequest
            ? {
              requesterName: selectedRequest.requesterName,
              avatar: selectedRequest.avatar,
              date: "Aug 5, 2024",
              requestName: selectedRequest.requestName,
              description: selectedRequest.description,
              wing: selectedRequest.unitLetter,
              unit: selectedRequest.unitNumber,
              priority: selectedRequest.priority,
              status: selectedRequest.status,
            }
            : null
        }
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Request?"
        message="Are you sure you want to delete this Request?"
      />
    </div>
  );
}