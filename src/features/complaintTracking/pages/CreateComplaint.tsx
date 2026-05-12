// src/pages/complaint-tracking/CreateComplaint.tsx

import { useMemo, useState, useEffect } from "react";
import Button from "../../../ui/Button";
import { EditIcon, EyeIcon, TrashIcon } from "../../../assets/icons/admin-dashboard-icons";
import {
    ComplaintFormModal,
    ComplaintViewModal,
    DeleteConfirmModal,
    type ComplaintFormData,
} from "../components";
import { complaintApi, authApi, societyApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";


type Priority = "Medium" | "Low" | "High";
type ComplaintStatus = "Pending" | "Open" | "Solve";

type Complaint = {
    id: string;
    complainerName: string;
    avatar: string;
    complaintName: string;
    description: string;
    unitLetter: string;
    unitNumber: string;
    priority: Priority;
    status: ComplaintStatus;
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

function statusClass(status: ComplaintStatus) {
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
    children: React.ReactNode;
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

function UnitBadge({
    letter,
    number,
}: {
    letter: string;
    number: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#F1F6FF] text-xs font-bold text-[#5678E9]">
                {letter}
            </span>
            <span className="font-medium text-[#202224]">{number}</span>
        </div>
    );
}

export default function CreateComplaint() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const rows = useMemo(() => complaints, [complaints]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    // Fetch complaints on component mount
    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            console.log("Fetching complaints...");

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

            console.log("Fetching complaints for society:", societyId);

            // Pass society ID to the API
            const response = await complaintApi.getAllComplaints(societyId);
            console.log("getAllComplaints response:", response);

            // Backend returns { complainList: [...] }
            const complaintsData = response.complainList || [];
            console.log("Complaints data:", complaintsData);

            if (!complaintsData || complaintsData.length === 0) {
                console.log("No complaints found");
                setComplaints([]);
                setLoading(false);
                return;
            }

            // Transform backend data to frontend format
            const transformedComplaints = complaintsData.map((item: any) => {
                console.log("Transforming complaint:", item);
                return {
                    id: item._id,
                    complainerName: item.compainerName,  // Backend uses 'compainerName'
                    avatar: item.avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
                    complaintName: item.complainName,     // Backend uses 'complainName'
                    description: item.description,
                    unitLetter: item.wing,
                    unitNumber: item.unit,
                    priority: item.priority as Priority,
                    status: item.status as ComplaintStatus,
                };
            });

            console.log("Transformed complaints:", transformedComplaints);
            setComplaints(transformedComplaints);
        } catch (error: any) {
            console.error("Error fetching complaints:", error);
            toast.error(error.message || "Failed to fetch complaints");
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateComplaint = () => {
        setShowCreateModal(true);
    };

    const handleEdit = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setShowEditModal(true);
    };

    const handleView = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setShowViewModal(true);
    };

    const handleDelete = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setShowDeleteModal(true);
    };

    const handleComplaintSubmit = async (data: ComplaintFormData) => {
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
                console.error("User profile:", user);
                return;
            }

            // Add society to the complaint data
            const payload = {
                compainerName: data.complainerName,  // Backend expects 'compainerName'
                complainName: data.complaintName,     // Backend expects 'complainName'
                description: data.description,
                wing: data.wing,
                unit: data.unit,
                priority: data.priority,
                status: data.status,
                society: societyId,
            };

            await complaintApi.createComplaint(payload);
            toast.success("Complaint created successfully!");
            setShowCreateModal(false);
            // Refresh complaints list
            await fetchComplaints();
        } catch (error: any) {
            toast.error(error.message || "Failed to create complaint");
            console.error("Create complaint error:", error);
        }
    };

    const handleComplaintUpdate = async (data: ComplaintFormData) => {
        try {
            if (!selectedComplaint) return;

            // Get user profile to get society ID
            const profileResponse = await authApi.getProfile();
            const user = profileResponse.user;

            if (!user) {
                toast.error("Unable to fetch user profile. Please try again.");
                return;
            }

            // Get society ID
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

            // Add society to the complaint data
            const payload = {
                compainerName: data.complainerName,  // Backend expects 'compainerName'
                complainName: data.complaintName,     // Backend expects 'complainName'
                description: data.description,
                wing: data.wing,
                unit: data.unit,
                priority: data.priority,
                status: data.status,
                society: societyId,
            };

            await complaintApi.editComplaint(selectedComplaint.id, payload);
            toast.success("Complaint updated successfully!");
            setShowEditModal(false);
            setSelectedComplaint(null);
            // Refresh complaints list
            await fetchComplaints();
        } catch (error: any) {
            toast.error(error.message || "Failed to update complaint");
            console.error("Update complaint error:", error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedComplaint) return;

            await complaintApi.deleteComplaint(selectedComplaint.id);
            toast.success("Complaint deleted successfully!");
            setShowDeleteModal(false);
            setSelectedComplaint(null);
            // Refresh complaints list
            await fetchComplaints();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete complaint");
            console.error("Delete complaint error:", error);
        }
    };

    return (
        <>
            <div className="rounded-2xl bg-white p-4 sm:p-5">
                {/* Header */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-semibold leading-8 text-[#202224]">
                        Create Complaint
                    </h1>

                    <Button
                        type="button"
                        onClick={handleCreateComplaint}
                        className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-5 text-sm font-semibold text-white shadow-none sm:w-auto"
                    >
                        Create Complaint
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl bg-white">
                    <div className="overflow-x-auto">
                        <div className="max-h-[calc(100vh-18rem)] min-w-[60rem] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                    <span className="ml-3 text-gray-600">Loading complaints...</span>
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-gray-500">No complaints found</p>
                                    <Button
                                        onClick={handleCreateComplaint}
                                        className="mt-4 h-12 rounded-xl px-6"
                                    >
                                        Create First Complaint
                                    </Button>
                                </div>
                            ) : (
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                                        <tr>
                                            <th className="rounded-l-xl px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Complainer Name
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Complaint Name
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Description
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
                                        {rows.map((complaint) => (
                                            <tr
                                                key={complaint.id}
                                                className="border-b border-[#EDF0F5] last:border-b-0"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={complaint.avatar}
                                                            alt={complaint.complainerName}
                                                            className="size-10 shrink-0 rounded-full object-cover"
                                                        />
                                                        <span className="text-sm font-medium text-[#434A57]">
                                                            {complaint.complainerName}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                    {complaint.complaintName}
                                                </td>

                                                <td className="max-w-md px-5 py-4">
                                                    <p className="truncate text-sm font-medium text-[#434A57]">
                                                        {complaint.description}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <UnitBadge
                                                        letter={complaint.unitLetter}
                                                        number={complaint.unitNumber}
                                                    />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${priorityClass(
                                                            complaint.priority
                                                        )}`}
                                                    >
                                                        {complaint.priority}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`mx-auto flex min-w-24 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                                                            complaint.status
                                                        )}`}
                                                    >
                                                        {complaint.status}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <ActionButton
                                                            label="Edit complaint"
                                                            variant="edit"
                                                            onClick={() => handleEdit(complaint)}
                                                        >
                                                            <EditIcon />
                                                        </ActionButton>

                                                        <ActionButton
                                                            label="View complaint"
                                                            variant="view"
                                                            onClick={() => handleView(complaint)}
                                                        >
                                                            <EyeIcon />
                                                        </ActionButton>

                                                        <ActionButton
                                                            label="Delete complaint"
                                                            variant="delete"
                                                            onClick={() => handleDelete(complaint)}
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
            </div>

            {/* Modals */}
            <ComplaintFormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleComplaintSubmit}
            />

            <ComplaintFormModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedComplaint(null);
                }}
                onSubmit={handleComplaintUpdate}
                initialData={
                    selectedComplaint
                        ? {
                            complainerName: selectedComplaint.complainerName,
                            complaintName: selectedComplaint.complaintName,
                            description: selectedComplaint.description,
                            wing: selectedComplaint.unitLetter,
                            unit: selectedComplaint.unitNumber,
                            priority: selectedComplaint.priority,
                            status: selectedComplaint.status,
                        }
                        : null
                }
                isEdit={true}
            />

            <ComplaintViewModal
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedComplaint(null);
                }}
                data={
                    selectedComplaint
                        ? {
                            complainerName: selectedComplaint.complainerName,
                            avatar: selectedComplaint.avatar,
                            date: "Aug 5, 2024",
                            complaintName: selectedComplaint.complaintName,
                            description: selectedComplaint.description,
                            wing: selectedComplaint.unitLetter,
                            unit: selectedComplaint.unitNumber,
                            priority: selectedComplaint.priority,
                            status: selectedComplaint.status,
                        }
                        : null
                }
            />

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedComplaint(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Complaint?"
                message="Are you sure you want to delete this Complaint?"
            />
        </>
    );
}