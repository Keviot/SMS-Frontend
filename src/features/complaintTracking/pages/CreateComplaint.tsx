// src/pages/complaint-tracking/CreateComplaint.tsx

import { useMemo, useState, useEffect } from "react";
import Button from "../../../ui/Button";
import { 
    ComplaintFormModal, 
    ComplaintViewModal, 
    RequestFormModal,
    RequestViewModal,
    DeleteConfirmModal, 
    type ComplaintFormData,
    type RequestFormData
} from "../components";
import { complaintApi, requestTrackingApi, authApi, societyApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2, MoreVertical } from "lucide-react";
import { cn } from "../../../lib/cn";

type Priority = "Medium" | "Low" | "High";
type Status = "Pending" | "Open" | "Closed" | "Solved";

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
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex rounded-t-xl bg-white p-1 w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab("complaint")}
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
                        activeTab === "complaint" ? "bg-[#FF6B35] text-white shadow-md" : "text-[#A7A7A7] hover:text-[#202224]"
                    )}
                >
                    Complaint Submission
                </button>
                <button
                    onClick={() => setActiveTab("request")}
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
                        activeTab === "request" ? "bg-[#FF6B35] text-white shadow-md" : "text-[#A7A7A7] hover:text-[#202224]"
                    )}
                >
                    Request Submission
                </button>
            </div>

            {/* Main Container */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#F4F4F4]">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#202224]">
                        {currentUser?.role === "admin" 
                            ? (activeTab === "complaint" ? "Create Complaint" : "Request Tracking")
                            : (activeTab === "complaint" ? "Complaint" : "Request")}
                    </h2>
                    <Button
                        onClick={handleCreate}
                        className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white border-none rounded-xl font-bold h-11 px-8 shadow-lg shadow-[#FF6B35]/20"
                    >
                        Create {activeTab === "complaint" ? "Complaint" : "Request"}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                        <p>No {activeTab}s found.</p>
                    </div>
                ) : currentUser?.role === "admin" ? (
                    /* Admin Table View */
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-0">
                            <thead>
                                <tr className="bg-[#F1F3FF]">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#202224] rounded-l-xl">Complainer Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#202224] truncate max-w-[150px]">
                                        {activeTab === "complaint" ? "Complaint Name" : "Request Name"}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#202224]">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#202224]">Unit Number</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-[#202224]">Priority</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-[#202224]">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-[#202224] rounded-r-xl">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${item.complainerName}&background=random`} alt="" className="h-full w-full object-cover" />
                                                </div>
                                                <span className="text-sm font-semibold text-[#4F5B7D]">{item.complainerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#4F5B7D]">{item.title}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-[#4F5B7D] truncate max-w-[200px]">{item.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="h-6 w-6 rounded-full bg-[#F6F8FB] text-[#5678E9] flex items-center justify-center text-[10px] font-bold">{item.wing}</span>
                                                <span className="text-sm font-semibold text-[#4F5B7D]">{item.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "mx-auto flex w-24 items-center justify-center rounded-full py-1.5 text-xs font-bold",
                                                item.priority === "High" ? "bg-[#E74C3C] text-white" :
                                                item.priority === "Medium" ? "bg-[#5678E9] text-white" : "bg-[#39973D] text-white"
                                            )}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "mx-auto flex w-24 items-center justify-center rounded-full py-1.5 text-xs font-bold",
                                                item.status === "Pending" ? "bg-[#FFF7E6] text-[#F0A000]" :
                                                item.status === "Open" ? "bg-[#EEF2FF] text-[#5678E9]" : "bg-[#E5F4E8] text-[#39973D]"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleAction(item, "edit")} className="p-2 rounded-lg bg-[#E8F7EC] text-[#39973D] hover:scale-110 transition-transform">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button onClick={() => handleAction(item, "view")} className="p-2 rounded-lg bg-[#EEF2FF] text-[#5678E9] hover:scale-110 transition-transform">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                </button>
                                                <button onClick={() => handleAction(item, "delete")} className="p-2 rounded-lg bg-[#FFF0F0] text-[#E74C3C] hover:scale-110 transition-transform">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Resident Card View */
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                            <div key={item.id} className="overflow-hidden rounded-2xl border border-[#F4F4F4] bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between bg-[#5678E9] px-4 py-3 text-white">
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
                                <div className="p-4 space-y-3">
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