// src/pages/complaint-tracking/CreateComplaint.tsx

import { useState, useEffect, type ReactNode } from "react";
import Button from "../../../ui/Button";
import {
    ComplaintFormModal,
    ComplaintViewModal,
    RequestFormModal,
    RequestViewModal,
    DeleteConfirmModal
} from "../components";
import {
    EditIcon,
    EyeIcon,
    TrashIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import { complaintApi, requestTrackingApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2, MoreVertical } from "lucide-react";
import { cn } from "../../../lib/cn";

type Priority = "Medium" | "Low" | "High";
type Status = "Pending" | "Open" | "Closed" | "Solved";

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

type Item = {
    id: string;
    complainerName: string;
    title: string;
    description: string;
    date: string;
    priority: Priority;
    status: Status;
    wing: string;
    unit: string;
};

export default function CreateComplaint() {
    const [activeTab, setActiveTab] = useState<"complaint" | "request">("complaint");
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileResponse = await authApi.getProfile();
            const user = profileResponse.user;
            setCurrentUser(user);

            if (!user) return;

            let societyId = user.society?._id || user.society || user.societies?.[0]?._id;

            if (activeTab === "complaint") {
                const res = await complaintApi.getAllComplaints(societyId);
                const list = res.complainList || [];
                setItems(list.map((item: any) => ({
                    id: item._id,
                    complainerName: item.compainerName,
                    title: item.complainName,
                    description: item.description,
                    date: new Date(item.createdAt).toLocaleDateString('en-GB'),
                    priority: item.priority,
                    status: item.status,
                    wing: item.wing,
                    unit: item.unit
                })));
            } else {
                const res = await requestTrackingApi.getAllRequests(societyId);
                const list = res.requestTrackingList || [];
                setItems(list.map((item: any) => ({
                    id: item._id,
                    complainerName: item.requesterName,
                    title: item.requestName,
                    description: item.description,
                    date: new Date(item.createdAt).toLocaleDateString('en-GB'),
                    priority: item.priority,
                    status: item.status,
                    wing: item.wing,
                    unit: item.unit
                })));
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => setShowCreateModal(true);

    const handleAction = (item: Item, action: "edit" | "view" | "delete") => {
        setSelectedItem(item);
        if (action === "edit") setShowEditModal(true);
        if (action === "view") setShowViewModal(true);
        if (action === "delete") setShowDeleteModal(true);
    };

    const handleSubmit = async (data: any) => {
        try {
            const societyId = currentUser.society?._id || currentUser.society || currentUser.societies?.[0]?._id;
            if (activeTab === "complaint") {
                await complaintApi.createComplaint({ ...data, compainerName: data.complainerName, complainName: data.complaintName, society: societyId });
            } else {
                await requestTrackingApi.createRequest({ ...data, society: societyId });
            }
            toast.success(`${activeTab === "complaint" ? "Complaint" : "Request"} created successfully!`);
            setShowCreateModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            if (!selectedItem) return;
            if (activeTab === "complaint") {
                await complaintApi.editComplaint(selectedItem.id, { ...data, compainerName: data.complainerName, complainName: data.complaintName });
            } else {
                await requestTrackingApi.editRequest(selectedItem.id, data);
            }
            toast.success(`${activeTab === "complaint" ? "Complaint" : "Request"} updated successfully!`);
            setShowEditModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedItem) return;
            if (activeTab === "complaint") {
                await complaintApi.deleteComplaint(selectedItem.id);
            } else {
                await requestTrackingApi.deleteRequest(selectedItem.id);
            }
            toast.success("Deleted successfully!");
            setShowDeleteModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-0">
            {/* Tabs - Only show for residents */}
            {currentUser?.role !== "admin" && (
                <div className="relative z-10 flex w-full items-end">
                    <button
                        type="button"
                        onClick={() => setActiveTab("complaint")}
                        className={cn(
                            "relative flex-1 sm:flex-none min-h-12 px-1 sm:px-10 py-3 text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center text-center leading-tight shrink-0",
                            activeTab === "complaint"
                                ? "z-10 rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white border-0"
                                : "z-0 rounded-t-xl border border-[#D9DCE5] border-b-0 bg-[#F6F8FB] text-[#6F7786] hover:bg-gray-50 hover:text-[#202224]"
                        )}
                    >
                        Complaint Submission
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("request")}
                        className={cn(
                            "relative flex-1 sm:flex-none -ml-[1px] min-h-12 px-1 sm:px-10 py-3 text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center text-center leading-tight shrink-0",
                            activeTab === "request"
                                ? "z-10 rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white border-0"
                                : "z-0 rounded-t-xl border border-[#D9DCE5] border-b-0 bg-[#F6F8FB] text-[#6F7786] hover:bg-gray-50 hover:text-[#202224]"
                        )}
                    >
                        Request Submission
                    </button>
                </div>
            )}

            {/* Content */}
            <div className={cn(
                "border border-[#D9DCE5] bg-white p-3 sm:p-5",
                currentUser?.role !== "admin" ? "-mt-px rounded-2xl rounded-tl-none rounded-tr-none" : "rounded-2xl"
            )}>
                <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-bold leading-7 text-[#202224] sm:text-xl">
                        {currentUser?.role === "admin"
                            ? (activeTab === "complaint" ? "Create Complaint" : "Create Request")
                            : (activeTab === "complaint" ? "Complaint" : "Request")}
                    </h2>
                    <Button
                        onClick={handleCreate}
                        className="h-11 w-full rounded-xl border-none bg-gradient-to-r from-[#FE512E] to-[#F09619] px-6 text-sm font-bold text-white shadow-lg shadow-[#FE512E]/20 hover:from-[#FE512E] hover:to-[#F09619] sm:w-auto sm:px-8"                    >
                        Create {activeTab === "complaint" ? "Complaint" : "Request"}
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl bg-white">
                    <div className="overflow-x-auto">
                        <div className={cn(
                            "overflow-y-auto pr-1 [scrollbar-width:thin]",
                            currentUser?.role === "admin" ? "max-h-[calc(100vh-18rem)] min-w-[62rem]" : "min-w-0"
                        )}>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                    <span className="ml-3 text-gray-600">Loading...</span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <svg
                                            className="h-8 w-8 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">
                                        No {activeTab}s Available
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        There are no {activeTab}s at the moment.
                                    </p>
                                </div>
                            ) : currentUser?.role === "admin" ? (
                                /* Admin Table View */
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                                        <tr>
                                            <th className="rounded-l-xl px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Complainer Name
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                {activeTab === "complaint" ? "Complaint Name" : "Request Name"}
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
                                        {items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-[#EDF0F5] last:border-b-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                                                {item.complainerName?.charAt(0)?.toUpperCase() || 'U'}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-medium text-[#434A57]">{item.complainerName}</span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                    {item.title}
                                                </td>

                                                <td className="max-w-md px-5 py-4">
                                                    <p className="truncate text-sm font-medium text-[#434A57]">
                                                        {item.description}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#F1F6FF] text-xs font-bold text-[#5678E9]">{item.wing}</span>
                                                        <span className="font-medium text-[#202224]">{item.unit}</span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={cn(
                                                        "mx-auto flex min-w-24 items-center justify-center rounded-full px-2.5 py-2 text-xs font-semibold",
                                                        item.priority === "High" ? "bg-[#E74C3C] text-white" :
                                                            item.priority === "Medium" ? "bg-[#5678E9] text-white" : "bg-[#39973D] text-white"
                                                    )}>
                                                        {item.priority}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={cn(
                                                        "mx-auto flex min-w-24 items-center justify-center rounded-full px-2.5 py-2 text-xs font-semibold",
                                                        item.status === "Pending" ? "bg-[#FFF7E6] text-[#F0A000]" :
                                                            item.status === "Open" ? "bg-[#EEF2FF] text-[#5678E9]" : "bg-[#E5F4E8] text-[#39973D]"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <ActionButton
                                                            label="Edit complaint"
                                                            variant="edit"
                                                            onClick={() => handleAction(item, "edit")}
                                                        >
                                                            <EditIcon />
                                                        </ActionButton>

                                                        <ActionButton
                                                            label="View complaint"
                                                            variant="view"
                                                            onClick={() => handleAction(item, "view")}
                                                        >
                                                            <EyeIcon />
                                                        </ActionButton>

                                                        <ActionButton
                                                            label="Delete complaint"
                                                            variant="delete"
                                                            onClick={() => handleAction(item, "delete")}
                                                        >
                                                            <TrashIcon />
                                                        </ActionButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                /* Resident Card View */
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="overflow-hidden rounded-2xl border border-[#D9DCE5] bg-white shadow-sm transition-shadow hover:shadow-md">
                                            <div className="flex min-h-10 items-center justify-between bg-[#5678E9] px-3 py-2 text-white">
                                                <h4 className="text-sm font-bold truncate pr-2">{item.title}</h4>
                                                <div className="relative group">
                                                    <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10 w-32 rounded-xl bg-white p-1 shadow-xl border border-[#F4F4F4]">
                                                        <button onClick={() => handleAction(item, "view")} className="w-full text-left px-4 py-2 text-xs font-bold text-[#202224] hover:bg-gray-50 rounded-lg">View</button>
                                                        {currentUser?.role === "admin" && (
                                                            <>
                                                                <button onClick={() => handleAction(item, "edit")} className="w-full text-left px-4 py-2 text-xs font-bold text-[#202224] hover:bg-gray-50 rounded-lg">Edit</button>
                                                                <button onClick={() => handleAction(item, "delete")} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg">Delete</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5 p-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-bold text-[#A7A7A7]">Request Date</span>
                                                    <span className="text-xs font-bold text-[#202224]">{item.date}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-bold text-[#A7A7A7]">Status</span>
                                                    <span className={cn(
                                                        "text-xs font-bold px-3 py-1 rounded-full",
                                                        item.status === "Open" ? "bg-[#EEF2FF] text-[#5678E9]" : "bg-[#E5F4E8] text-[#39973D]"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold text-[#A7A7A7]">Description</span>
                                                    <p className="text-[11px] leading-relaxed text-[#202224] line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeTab === "complaint" ? (
                <ComplaintFormModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleSubmit}
                />
            ) : (
                <RequestFormModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleSubmit}
                />
            )}

            {activeTab === "complaint" ? (
                <ComplaintFormModal
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleUpdate}
                    initialData={selectedItem ? {
                        complainerName: selectedItem.complainerName,
                        complaintName: selectedItem.title,
                        description: selectedItem.description,
                        wing: selectedItem.wing,
                        unit: selectedItem.unit,
                        priority: selectedItem.priority,
                        status: selectedItem.status as any,
                    } : null}
                    isEdit
                />
            ) : (
                <RequestFormModal
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleUpdate}
                    initialData={selectedItem ? {
                        requesterName: selectedItem.complainerName,
                        requestName: selectedItem.title,
                        description: selectedItem.description,
                        requestDate: selectedItem.date,
                        wing: selectedItem.wing,
                        unit: selectedItem.unit,
                        priority: selectedItem.priority,
                        status: selectedItem.status as any,
                    } : null}
                    isEdit
                />
            )}

            {activeTab === "complaint" ? (
                <ComplaintViewModal
                    open={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    data={selectedItem ? {
                        complainerName: selectedItem.complainerName,
                        initials: selectedItem.complainerName.charAt(0),
                        date: selectedItem.date,
                        complaintName: selectedItem.title,
                        description: selectedItem.description,
                        wing: selectedItem.wing,
                        unit: selectedItem.unit,
                        priority: selectedItem.priority,
                        status: selectedItem.status as any,
                    } : null}
                />
            ) : (
                <RequestViewModal
                    open={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    data={selectedItem ? {
                        requesterName: selectedItem.complainerName,
                        avatar: "",
                        date: selectedItem.date,
                        requestName: selectedItem.title,
                        description: selectedItem.description,
                        wing: selectedItem.wing,
                        unit: selectedItem.unit,
                        priority: selectedItem.priority,
                        status: selectedItem.status as any,
                    } : null}
                />
            )}

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title={`Delete ${activeTab}?`}
                message={`Are you sure you want to delete this ${activeTab}?`}
            />
        </div>
    );
}