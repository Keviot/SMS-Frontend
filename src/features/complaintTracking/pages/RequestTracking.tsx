import { useMemo, useState, useEffect, type ReactNode } from "react";
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
import { requestTrackingApi, authApi, societyApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type Priority = "Medium" | "Low" | "High";
type RequestStatus = "Pending" | "Open" | "Solved";

type RequestItem = {
  id: string;
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
    case "Solved":
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
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const rows = useMemo(() => requests, [requests]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Get user profile to get society ID
      const profileResponse = await authApi.getProfile();
      const user = profileResponse.user;

      if (!user) {
        toast.error("Unable to fetch user profile. Please try again.");
        setLoading(false);
        return;
      }

      // Get society ID - check multiple possible locations
      let societyId = user.society;

      if (!societyId && user.societies && user.societies.length > 0) {
        societyId = user.societies[0]._id;
      }

      if (!societyId && user.selectSociety && user.selectSociety.length > 0) {
        const societies = await societyApi.getAll();
        const matchingSociety = societies.data.find(
          (s: any) => user.selectSociety.includes(s.societyName)
        );
        if (matchingSociety) {
          societyId = matchingSociety._id;
        }
      }

      // Pass society ID to the API
      const response = await requestTrackingApi.getAllRequests(societyId);

      // Backend returns { requestTrackingList: [...] }
      const requestsData = response.requestTrackingList || [];

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Transform backend data to frontend format
      const transformedRequests = requestsData.map((item: any) => ({
        id: item._id,
        requesterName: item.requesterName,
        avatar: item.avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
        requestName: item.requestName,
        description: item.description || "",
        requestDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : "",
        unitLetter: item.wing,
        unitNumber: item.unit,
        priority: item.priority as Priority,
        status: item.status as RequestStatus,
      }));

      setRequests(transformedRequests);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error(error.message || "Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRequestSubmit = async (data: RequestFormData) => {
    try {
      // Get user profile to get society ID
      const profileResponse = await authApi.getProfile();
      const user = profileResponse.user;

      if (!user) {
        toast.error("Unable to fetch user profile. Please try again.");
        return;
      }

      // Get society ID - check multiple possible locations
      let societyId = user.society;

      if (!societyId && user.societies && user.societies.length > 0) {
        societyId = user.societies[0]._id;
      }

      if (!societyId && user.selectSociety && user.selectSociety.length > 0) {
        const societies = await societyApi.getAll();
        const matchingSociety = societies.data.find(
          (s: any) => user.selectSociety.includes(s.societyName)
        );
        if (matchingSociety) {
          societyId = matchingSociety._id;
        }
      }

      if (!societyId) {
        toast.error("Society information not found. Please contact administrator.");
        return;
      }

      // Add society to the request data
      const payload = {
        requesterName: data.requesterName,
        requestName: data.requestName,
        description: data.description,
        wing: data.wing,
        unit: data.unit,
        priority: data.priority,
        status: data.status,
        society: societyId,
      };

      await requestTrackingApi.createRequest(payload);
      toast.success("Request created successfully!");
      setShowCreateModal(false);
      // Refresh requests list
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to create request");
      console.error("Create request error:", error);
    }
  };

  const handleRequestUpdate = async (data: RequestFormData) => {
    try {
      if (!selectedRequest) return;

      const payload = {
        requesterName: data.requesterName,
        requestName: data.requestName,
        description: data.description,
        wing: data.wing,
        unit: data.unit,
        priority: data.priority,
        status: data.status,
      };

      await requestTrackingApi.editRequest(selectedRequest.id, payload);
      toast.success("Request updated successfully!");
      setShowEditModal(false);
      setSelectedRequest(null);
      // Refresh requests list
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to update request");
      console.error("Update request error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedRequest) return;

      await requestTrackingApi.deleteRequest(selectedRequest.id);
      toast.success("Request deleted successfully!");
      setShowDeleteModal(false);
      setSelectedRequest(null);
      // Refresh requests list
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete request");
      console.error("Delete request error:", error);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold leading-8 text-[#202224]">
          Request Tracking
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
          <div className="max-h-[calc(100vh-18.75rem)] min-w-[60rem] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-600">Loading requests...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-500">No requests found</p>
                <Button
                  onClick={handleCreateRequest}
                  className="mt-4 h-12 rounded-xl px-6"
                >
                  Create First Request
                </Button>
              </div>
            ) : (
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
                          className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-2.5 py-2 text-xs font-semibold ${priorityClass(
                            request.priority
                          )}`}
                        >
                          {request.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-2.5 py-2 text-xs font-semibold ${statusClass(
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
            )}
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
              description: selectedRequest.description,
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