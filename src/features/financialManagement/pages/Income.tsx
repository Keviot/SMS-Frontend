import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Plus, User, Wallet } from "lucide-react";
import DataTable, { type DataTableColumn } from "../../../ui/DataTable";
import StatusBadge from "../../../ui/StatusBadge";
import Button from "../../../ui/Button";
import FormSelect from "../../../ui/FormSelect";
import { cn } from "../../../lib/cn";
import { authApi, financialApi, societyApi, BASE_URL } from "../../../services/api";
import SetMaintenancePasswordModal from "../components/SetMaintenancePasswordModal";
import AddMaintenanceDetailModal, {
    type MaintenanceDetailData,
} from "../components/AddMaintenanceDetailModal";
import ViewMaintenanceDetailsModal from "../components/ViewMaintenanceDetailsModal";
import OtherIncomeCard from "../components/OtherIncomeCard";
import CreateOtherIncomeModal, {
    type OtherIncomeData,
} from "../components/CreateOtherIncomeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import toast from "react-hot-toast";
import { EyeIcon } from "../../../assets/icons/admin-dashboard-icons";
import Avatar from "../../../components/Avatar";

interface MaintenanceRecord {
    id: string;
    fullName: string;
    unitNumber: string;
    date: string;
    status: "tenant" | "owner";
    phoneNumber: string;
    amount: number;
    penalty: number | null;
    paymentStatus: "pending" | "due" | "paid";
    paymentMode: "online" | "cash";
    avatar?: string;
}

interface MaintenanceSummary {
    maintenanceAmount: number;
    penaltyAmount: number;
    totalDue: number;
    totalPending: number;
}

interface OtherIncome {
    id: string;
    title: string;
    amountPerMember: number;
    totalMember: number;
    date: string;
    dueDate: string;
    description: string;
}

const normalizeMaintenanceRecord = (item: any): MaintenanceRecord => {
    const fullName = item.name || item.resident?.name || "N/A";
    const avatar = item.resident?.profileImage
        ? (item.resident.profileImage.startsWith("http") ? item.resident.profileImage : `${BASE_URL}/${item.resident.profileImage}`)
        : undefined;
    const formattedDate = new Date(item.date).toLocaleDateString("en-GB");

    // Priority: item.residentStatus > item.resident.residentStatus > item.resident.ResidentStatus
    let residentStatus = (item.residentStatus || item.resident?.residentStatus || item.resident?.ResidentStatus || "Tenant").toLowerCase();

    if (residentStatus !== "tenant" && residentStatus !== "owner") {
        residentStatus = "tenant";
    }

    const paymentStatus = item.status?.toLowerCase() || "pending";

    let paymentMode = item.payment?.toLowerCase?.() || "online";
    if (paymentMode === "upi") {
        paymentMode = "online";
    } else if (paymentMode === "cheque") {
        paymentMode = "cash";
    }

    if (!["online", "cash"].includes(paymentMode)) {
        paymentMode = "online";
    }

    const amount = item.maintenanceSetup?.maintenanceAmount || item.amount || 0;

    let penalty = null;
    if (item.penalty > 0) {
        penalty = item.penalty;
    } else if (item.maintenanceSetup?.penaltyAmount && item.maintenanceSetup?.penaltyAppliedAfterDay) {
        const dueDate = new Date(item.maintenanceSetup.maintenanceDueDate);
        const currentDate = new Date();
        const daysDiff = Math.floor(
            (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (
            daysDiff > item.maintenanceSetup.penaltyAppliedAfterDay &&
            item.status?.toLowerCase?.() === "pending"
        ) {
            penalty = item.maintenanceSetup.penaltyAmount;
        }
    }

    return {
        id: item._id,
        fullName,
        unitNumber: `${item.wing || "-"} ${item.unit || "-"}`,
        date: formattedDate,
        status: residentStatus as "tenant" | "owner",
        phoneNumber: item.phoneNumber || "--",
        amount,
        penalty,
        paymentStatus: paymentStatus as "pending" | "due" | "paid",
        paymentMode: paymentMode as "online" | "cash",
        avatar,
    };
};

const calculateSummary = (records: MaintenanceRecord[]): MaintenanceSummary => {
    const collected = records.filter((record) => record.paymentStatus === "paid");
    const pending = records.filter((record) => record.paymentStatus === "pending" || record.paymentStatus === "due");

    return {
        maintenanceAmount: collected.reduce((sum, record) => sum + record.amount, 0),
        penaltyAmount: collected
            .filter((record) => record.penalty)
            .reduce((sum, record) => sum + (record.penalty || 0), 0),
        totalDue: pending.reduce((sum, record) => sum + record.amount + (record.penalty || 0), 0),
        totalPending: pending.length,
    };
};

export default function Income() {
    const [selectedTab, setSelectedTab] = useState<"Maintenance" | "Other Income" | "Event Participation">("Maintenance");
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [otherIncomeRecords, setOtherIncomeRecords] = useState<any[]>([]);
    const [eventPaymentRecords, setEventPaymentRecords] = useState<any[]>([]);
    const [otherIncomeSummary, setOtherIncomeSummary] = useState({ totalAmount: 0 });
    const [selectedMonth, setSelectedMonth] = useState<"Month" | "Year">("Month");
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [maintenanceData, setMaintenanceData] = useState<MaintenanceRecord[]>([]);
    const [otherIncomeData, setOtherIncomeData] = useState<OtherIncome[]>([]);
    const [summary, setSummary] = useState<MaintenanceSummary>({
        maintenanceAmount: 0,
        penaltyAmount: 0,
        totalDue: 0,
        totalPending: 0,
    });
    const [loading, setLoading] = useState(true);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
    const [showCreateIncomeModal, setShowCreateIncomeModal] = useState(false);
    const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState<OtherIncome | null>(null);
    const [selectedIncomeForView, setSelectedIncomeForView] = useState<OtherIncome | null>(null);
    const [maintenancePassword, setMaintenancePassword] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [maintenanceRes, otherIncomeRes, eventPaymentRes] = await Promise.all([
                financialApi.getMaintenanceRecords(),
                financialApi.getOtherIncome(),
                import("../../../services/api").then(m => m.eventPaymentApi.get()).catch(() => ({ data: [] }))
            ]);

            setMaintenanceRecords(maintenanceRes.data || []);
            setOtherIncomeRecords(otherIncomeRes.data || []);
            setEventPaymentRecords(eventPaymentRes.data || []);

            // Calculate Other Income Summary (Always needed for total income)
            const manualTotal = otherIncomeRes.data?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
            const eventTotal = eventPaymentRes.data?.filter((item: any) => item.status === "Paid").reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
            const totalOther = manualTotal + eventTotal;
            setOtherIncomeSummary({ totalAmount: totalOther });

            if (selectedTab === "Maintenance") {
                const response = maintenanceRes;
                if (!response.data || response.data.length === 0) {
                    setMaintenanceData([]);
                    setSummary({ maintenanceAmount: 0, penaltyAmount: 0, totalDue: 0, totalPending: 0 });
                } else {
                    const transformedData = response.data.map(normalizeMaintenanceRecord);
                    transformedData.sort((a: MaintenanceRecord, b: MaintenanceRecord) => {
                        const wingA = a.unitNumber.split(" ")[0];
                        const wingB = b.unitNumber.split(" ")[0];
                        if (wingA !== wingB) return wingA.localeCompare(wingB);
                        const unitA = parseInt(a.unitNumber.split(" ")[1]);
                        const unitB = parseInt(b.unitNumber.split(" ")[1]);
                        return unitA - unitB;
                    });
                    setMaintenanceData(transformedData);
                    setSummary(calculateSummary(transformedData));
                }
            } else if (selectedTab === "Other Income") {
                const manualIncome = otherIncomeRes.data?.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    amountPerMember: item.amount,
                    totalMember: 1,
                    date: new Date(item.date).toLocaleDateString("en-GB"),
                    dueDate: new Date(item.dueDate).toLocaleDateString("en-GB"),
                    description: item.description,
                })) || [];

                // Aggregate event payments
                const eventAgg = eventPaymentRes.data?.reduce((acc: any, curr: any) => {
                    const eventId = curr.event?._id || curr.event;
                    if (!acc[eventId]) {
                        acc[eventId] = {
                            id: eventId,
                            title: curr.event?.title || "Event Participation",
                            amount: 0,
                            count: 0,
                            date: curr.event?.date || curr.createdAt,
                            description: curr.event?.description || "Participation fees collected for society event."
                        };
                    }
                    acc[eventId].amount += curr.amount;
                    acc[eventId].count += 1;
                    return acc;
                }, {}) || {};

                const eventIncome = Object.values(eventAgg).map((ev: any) => ({
                    id: ev.id,
                    title: ev.title,
                    amountPerMember: ev.amount / (ev.count || 1),
                    totalMember: ev.count,
                    date: new Date(ev.date).toLocaleDateString("en-GB"),
                    dueDate: "-",
                    description: ev.description,
                    isEvent: true
                }));

                setOtherIncomeData([...manualIncome, ...eventIncome]);
            }
        } catch (err: any) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedTab]);

    const handleSetMaintenance = () => {
        setShowPasswordModal(true);
    };

    const handlePasswordSuccess = (password: string) => {
        setMaintenancePassword(password);
        setShowPasswordModal(false);
        setShowAddMaintenanceModal(true);
    };

    const handleAddMaintenanceSubmit = async (data: MaintenanceDetailData) => {
        try {
            const profileResponse = await authApi.getProfile();
            const user = profileResponse.user;

            if (!user) {
                toast.error("Unable to fetch user profile. Please try again.");
                return;
            }

            let societyId = user.society;

            if (!societyId && user.societies && user.societies.length > 0) {
                societyId = user.societies[0]._id;
            }

            if (!societyId && user.selectSociety && user.selectSociety.length > 0) {
                const societies = await societyApi.getAll();
                const matchingSociety = societies.data.find((society: any) =>
                    user.selectSociety.includes(society.societyName)
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

            const dueDate = new Date(data.maintenanceDueDate);
            const payload = {
                password: maintenancePassword,
                maintenanceAmount: parseFloat(data.maintenanceAmount),
                penaltyAmount: parseFloat(data.penaltyAmount),
                maintenanceDueDate: dueDate.toISOString(),
                penaltyAppliedAfterDay: parseInt(data.penaltyAppliedAfterDay),
                society: societyId,
                paymentMethod: data.paymentMethod,
            };

            const setupResponse = await financialApi.setMaintenanceSetup(payload);

            if (setupResponse.data) {
                toast.success("Maintenance setup created successfully!");
            }

            setShowAddMaintenanceModal(false);
            setMaintenancePassword("");
            setLoading(true);

            const response = await financialApi.getMaintenanceRecords();

            if (!response.data || response.data.length === 0) {
                toast("Maintenance setup created, but no residents found in this society. Add residents first.", {
                    icon: "ℹ️",
                    duration: 5000,
                });
            }

            const transformedData = response.data.map(normalizeMaintenanceRecord);

            // Sort by Unit Number (Wing first, then Unit)
            transformedData.sort((a: MaintenanceRecord, b: MaintenanceRecord) => {
                const wingA = a.unitNumber.split(" ")[0];
                const wingB = b.unitNumber.split(" ")[0];
                if (wingA !== wingB) return wingA.localeCompare(wingB);

                const unitA = parseInt(a.unitNumber.split(" ")[1]);
                const unitB = parseInt(b.unitNumber.split(" ")[1]);
                return unitA - unitB;
            });

            setMaintenanceRecords(transformedData);
            setSummary(calculateSummary(transformedData));
            setLoading(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to create maintenance setup");
            console.error("Maintenance setup error:", error);
            setLoading(false);
        }
    };

    const handleViewDetails = (row: MaintenanceRecord) => {
        setSelectedMaintenance(row);
        setShowViewDetailsModal(true);
    };

    const handleCreateIncome = () => {
        setShowCreateIncomeModal(true);
    };

    const handleEditIncome = (id: string) => {
        const income = otherIncomeData.find((item) => item.id === id);
        if (income) {
            setSelectedIncome(income);
            setShowEditIncomeModal(true);
        }
    };

    const handleDeleteIncome = (id: string) => {
        const income = otherIncomeData.find((item) => item.id === id);
        if (income) {
            setSelectedIncome(income);
            setShowDeleteModal(true);
        }
    };

    const handleViewIncome = (id: string) => {
        const income = otherIncomeData.find((item) => item.id === id);
        if (income) {
            setSelectedIncomeForView(income);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedIncome) return;

            await financialApi.deleteOtherIncome(selectedIncome.id);
            toast.success("Income deleted successfully!");
            setShowDeleteModal(false);
            setSelectedIncome(null);

            // Refresh all data
            await fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete income");
            console.error("Delete income error:", error);
        }
    };

    const handleIncomeSubmit = async (data: OtherIncomeData) => {
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

            // Convert date strings to ISO format for backend
            const payload = {
                title: data.title,
                amount: parseFloat(data.amount),
                date: new Date(data.date).toISOString(),
                dueDate: new Date(data.dueDate).toISOString(),
                description: data.description,
                society: societyId,
            };

            await financialApi.addOtherIncome(payload);
            toast.success("Income created successfully!");
            setShowCreateIncomeModal(false);

            // Refresh all data
            await fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to create income");
            console.error("Create income error:", error);
        }
    };

    const handlePaymentUpdate = async (id: string, paymentMode: string) => {
        try {
            // When admin changes payment to Cash, we assume they received the money and mark as Paid.
            // If they change it to Online, we keep it as Pending (since it will be updated by resident/razorpay).
            const status = paymentMode === "Cash" ? "Paid" : "Pending";

            await financialApi.updateMaintenanceStatus(id, {
                status,
                payment: paymentMode
            });

            toast.success(`Record updated to ${status} via ${paymentMode}`);
            fetchData();
        } catch (error: any) {
            toast.error("Failed to update payment status");
            console.error(error);
        }
    };

    // Payment mode options for FormSelect
    const paymentModeOptions = [
        { label: "Online", value: "Online" },
        { label: "Cash", value: "Cash" },
    ];

    const handleIncomeEdit = async (data: OtherIncomeData) => {
        try {
            if (!selectedIncome) return;

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

            // Convert date strings to ISO format for backend
            const payload = {
                title: data.title,
                amount: parseFloat(data.amount),
                date: new Date(data.date).toISOString(),
                dueDate: new Date(data.dueDate).toISOString(),
                description: data.description,
                society: societyId,
            };

            await financialApi.editOtherIncome(selectedIncome.id, payload);
            toast.success("Income updated successfully!");
            setShowEditIncomeModal(false);
            setSelectedIncome(null);

            // Refresh all data
            await fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to update income");
            console.error("Edit income error:", error);
        }
    };

    const maintenanceColumns: DataTableColumn<MaintenanceRecord>[] = [
        {
            key: "fullName",
            header: "Name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex shrink-0">
                        <Avatar
                            src={row.avatar}
                            name={row.fullName}
                        />
                    </div>
                    <span className="text-gray-900">{row.fullName}</span>
                </div>
            ),
        },
        {
            key: "unitNumber",
            header: "Unit Number",
            render: (row) => {
                const wing = row.unitNumber.split(" ")[0] || "-";
                const unit = row.unitNumber.split(" ")[1] || "-";
                const getWingClass = (w: string) => {
                    switch (w.toUpperCase()) {
                        case 'A': return "bg-blue-50 text-blue-500";
                        case 'B': return "bg-purple-50 text-purple-500";
                        case 'C': return "bg-teal-50 text-teal-500";
                        case 'D': return "bg-pink-50 text-pink-500";
                        default: return "bg-blue-50 text-blue-500";
                    }
                };
                return (
                    <div className="flex items-center gap-2">
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", getWingClass(wing))}>
                            {wing}
                        </span>
                        <span className="font-semibold text-white-black">{unit}</span>
                    </div>
                );
            },
        },
        {
            key: "date",
            header: "Date",
            className: "text-center",
            render: (row) => <span className="font-medium text-gray-600">{row.date}</span>,
        },
        {
            key: "status",
            header: "Status",
            className: "text-center",
            render: (row) => (
                <StatusBadge variant={row.status} icon={User}>
                    {row.status}
                </StatusBadge>
            ),
        },
        {
            key: "phoneNumber",
            header: "Phone Number",
            className: "text-center",
            render: (row) => <span className="font-medium text-gray-600">{row.phoneNumber}</span>,
        },
        {
            key: "amount",
            header: "Amount",
            className: "text-center",
            render: (row) => <span className="font-semibold text-[#39973D]">₹ {row.amount}</span>,
        },
        {
            key: "penalty",
            header: "Penalty",
            className: "text-center",
            render: (row) =>
                row.penalty ? (
                    <span className="inline-flex min-h-8 min-w-16 items-center justify-center rounded-full bg-[#E74C3C] px-3 py-1 text-sm font-semibold text-white">
                        {row.penalty}
                    </span>
                ) : (
                    <span className="inline-flex min-h-8 min-w-16 items-center justify-center rounded-full bg-gray-light-grey px-3 py-1 text-sm font-semibold text-gray-400">
                        --
                    </span>
                ),
        },
        {
            key: "paymentStatus",
            header: "Status",
            className: "text-center",
            render: (row) => <StatusBadge variant={row.paymentStatus}>{row.paymentStatus}</StatusBadge>,
        },
        {
            key: "paymentMode",
            header: "Payment",
            className: "text-center",
            render: (row) => (
                row.paymentStatus !== "paid" ? (
                    <div className="flex items-center justify-center">
                        <div className="h-[31px] w-[100px] overflow-visible [&>div]:h-[31px] [&>div]:w-[100px] [&_button]:h-[31px] [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-[#F5F5F5] [&_button]:px-[15px] [&_button]:text-[12px] [&_button]:font-semibold [&_button]:capitalize [&_svg]:size-4">
                            <FormSelect
                                value={row.paymentMode === "online" ? "Online" : "Cash"}
                                onChange={(value) => handlePaymentUpdate(row.id, value)}
                                options={paymentModeOptions}
                                className="w-[100px]"
                            />
                        </div>
                    </div>
                ) : (
                    <StatusBadge variant={row.paymentMode} icon={Wallet}>
                        {row.paymentMode}
                    </StatusBadge>
                )
            ),
        },
        {
            key: "actions",
            header: "Action",
            className: "text-center",
            render: (row) => (
                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => handleViewDetails(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#5678E9] transition-colors hover:bg-blue-hover hover:text-black"
                    >
                        <EyeIcon className="size-4" />
                    </button>
                </div>
            ),
        },
    ];

    const otherIncomeColumns: DataTableColumn<any>[] = [
        { key: "title", header: "Title" },
        { key: "amount", header: "Amount", render: (row) => `₹ ${row.amount}` },
        { key: "date", header: "Date", render: (row) => new Date(row.date).toLocaleDateString("en-GB") },
        { key: "dueDate", header: "Due Date" },
        { key: "description", header: "Description" },
    ];

    const incomeParticipantRows = maintenanceData.length > 0 ? maintenanceData : [];

    if (selectedIncomeForView) {
        return (
            <div className="rounded-2xl bg-white p-4 sm:p-5">
                <h2 className="mb-5 text-xl font-semibold leading-8 text-[#202224]">
                    {selectedIncomeForView.title} Participator Member List
                </h2>

                <div className="overflow-hidden rounded-xl bg-white">
                    <div className="overflow-x-auto">
                        <div className="max-h-[calc(100vh-14rem)] min-w-[60rem] overflow-y-auto pr-1">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                                    <tr>
                                        <th className="rounded-l-xl px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                            Unit Number
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                            Payment Date
                                        </th>
                                        <th className="px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                                            Tenant/Owner Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                            Phone Number
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                            Amount
                                        </th>
                                        <th className="rounded-r-xl px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                                            Payment
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {incomeParticipantRows.map((row) => (
                                        <tr key={row.id} className="border-b border-[#EDF0F5] last:border-b-0">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-7 items-center justify-center rounded-full bg-[#F1F6FF] text-xs font-bold text-[#5678E9]">
                                                        {row.unitNumber.charAt(0)}
                                                    </span>

                                                    <span className="text-sm font-medium text-[#434A57]">
                                                        {row.unitNumber.split(" ")[1]}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                {selectedIncomeForView.date || row.date}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge variant={row.status} icon={User}>
                                                    {row.status}
                                                </StatusBadge>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                {row.phoneNumber}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-[#39973D]">
                                                ₹ {selectedIncomeForView.amountPerMember}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge variant={row.paymentMode} icon={Wallet}>
                                                    {row.paymentMode}
                                                </StatusBadge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getFilteredRecords = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-11
        const currentYear = currentDate.getFullYear();

        return maintenanceRecords.map(normalizeMaintenanceRecord).filter((record) => {
            if (record.date === "Invalid Date") return false;

            const parts = record.date.split("/");
            if (parts.length < 3) return false;

            const month = parseInt(parts[1], 10) - 1; // 0-11
            const year = parseInt(parts[2], 10);

            if (selectedMonth === "Month") {
                return month === currentMonth && year === currentYear;
            } else {
                return year === currentYear;
            }
        });
    };

    const filteredRecords = getFilteredRecords();
    const dynamicSummary = calculateSummary(filteredRecords);

    return (
        <div className="flex flex-col gap-0">
            {selectedTab === "Maintenance" && (
                <div className="mb-4 flex flex-col gap-4 rounded-2xl bg-white p-4 sm:p-5 lg:min-h-36 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:flex lg:items-center lg:gap-4">
                        {/* Maintenance Amount */}
                        <div className="relative flex min-h-24 w-full flex-col justify-center rounded-2xl bg-white pl-8 pr-4 py-4 shadow-sm lg:w-64 border border-gray-100 overflow-hidden">
                            {/* Left Pill */}
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-10 w-2 rounded-full bg-[#39973D] opacity-60" />
                            {/* Top-Right Accent with Extended Right Border Fade */}
                            <div
                                className="absolute -top-[1.5px] -right-[1.5px] h-20 w-16 rounded-tr-2xl border-r-3 border-t-2 border-[#39973D]"
                                style={{ maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}
                            />

                            <div className="text-sm font-semibold text-[#202224] opacity-70">Maintenance Amount</div>
                            <div className="mt-1 text-2xl font-bold text-[#39973D]">
                                {loading ? <Loader2 className="size-6 animate-spin" /> : `₹ ${dynamicSummary.maintenanceAmount.toLocaleString()}`}
                            </div>
                        </div>

                        {/* Penalty Amount */}
                        <div className="relative flex min-h-24 w-full flex-col justify-center rounded-2xl bg-white pl-8 pr-4 py-4 shadow-sm lg:w-64 border border-gray-100 overflow-hidden">
                            {/* Left Pill */}
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-10 w-2 rounded-full bg-[#E74C3C] opacity-60" />
                            {/* Top-Right Accent with Extended Right Border Fade */}
                            <div
                                className="absolute -top-[1.5px] -right-[1.5px] h-20 w-16 rounded-tr-2xl border-r-3 border-t-2 border-[#E74C3C]"
                                style={{ maskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at top right, black 0%, transparent 70%)' }}
                            />

                            <div className="text-sm font-semibold text-[#202224] opacity-70">Penalty Amount</div>
                            <div className="mt-1 text-2xl font-bold text-[#E74C3C]">
                                {loading ? <Loader2 className="size-6 animate-spin" /> : `₹ ${dynamicSummary.penaltyAmount.toLocaleString()}`}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSetMaintenance}
                        className="min-h-12 w-full whitespace-nowrap rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)] lg:w-auto"
                    >
                        Set Maintenance
                    </Button>
                </div>
            )}
            {/* {(selectedTab === "Other Income" || selectedTab === "Event Participation") && (
                <div className="mb-4 flex flex-col gap-4 rounded-2xl bg-white p-4 sm:p-5 lg:min-h-36 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:flex lg:items-center lg:gap-2">
                        
                        <div className="flex min-h-24 w-full flex-col justify-center rounded-2xl border border-l-4 border-[#39973D] bg-white px-3 py-4 shadow-sm lg:w-64">
                            <div className="text-xs font-medium text-[#202224]">Total Other Income</div>
                            <div className="mt-1 text-2xl font-bold text-[#39973D]">
                                ₹ {otherIncomeSummary.totalAmount.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )} */}


            <div className="relative z-10 flex w-full items-end overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setSelectedTab("Maintenance")}
                    className={cn(
                        "min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold transition-all",
                        selectedTab === "Maintenance"
                            ? "rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white shadow-md"
                            : "rounded-t-xl border border-[#D9DCE5] bg-white text-[#202224] hover:bg-gray-50"
                    )}
                >
                    Maintenance
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("Other Income")}
                    className={cn(
                        "min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold transition-all",
                        selectedTab === "Other Income"
                            ? "rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white shadow-md"
                            : "rounded-t-xl border border-[#D9DCE5] bg-white text-[#202224] hover:bg-gray-50"
                    )}
                >
                    Other Income
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("Event Participation")}
                    className={cn(
                        "min-h-14 min-w-32 shrink-0 px-8 py-4 text-sm font-bold transition-all",
                        selectedTab === "Event Participation"
                            ? "rounded-t-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white shadow-md"
                            : "rounded-t-xl border border-[#D9DCE5] bg-white text-[#202224] hover:bg-gray-50"
                    )}
                >
                    Event Participation
                </button>
            </div>

            <div className="-mt-px rounded-2xl rounded-tl-none border border-[#D9DCE5] bg-white p-4 sm:p-5">
                {selectedTab === "Maintenance" && (
                    <>
                        <div className="mb-5 flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold text-[#202224]">Maintenance Details</h2>
                            <div className="relative w-fit">
                                <button
                                    type="button"
                                    onClick={() => setShowMonthDropdown((prev) => !prev)}
                                    className="flex min-h-10 min-w-24 items-center justify-between gap-2 rounded-xl border border-[#D9DCE5] bg-white px-4 py-2 text-sm font-medium text-[#202224] transition-colors hover:bg-gray-50"
                                >
                                    {selectedMonth}
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform ${showMonthDropdown ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {showMonthDropdown && (
                                    <div className="absolute right-0 top-[calc(100%+0.25rem)] z-40 w-24 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                        {(["Month", "Year"] as const).map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMonth(item);
                                                    setShowMonthDropdown(false);
                                                }}
                                                className={`block w-full px-3 py-2 text-left text-xs font-medium transition-colors ${selectedMonth === item
                                                    ? "bg-[#F6F8FB] text-[#202224]"
                                                    : "text-[#6F7786] hover:bg-[#F6F8FB] hover:text-[#202224]"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DataTable
                            columns={maintenanceColumns}
                            data={filteredRecords.sort((a, b) => b.date.localeCompare(a.date))}
                            isLoading={loading}
                        />
                    </>
                )}

                {selectedTab === "Other Income" && (
                    <>
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold text-[#202224]">Other Income</h2>
                            <Button
                                leftIcon={<Plus size={18} />}
                                onClick={handleCreateIncome}
                                className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)] sm:w-auto"
                            >
                                Create Other Income
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {otherIncomeData.map((income) => (
                                <OtherIncomeCard
                                    key={income.id}
                                    data={income}
                                    onEdit={handleEditIncome}
                                    onDelete={handleDeleteIncome}
                                    onView={handleViewIncome}
                                />
                            ))}
                        </div>

                        {otherIncomeData.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#F6F8FB] rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No other income records found</p>
                            </div>
                        )}
                    </>
                )}

                {selectedTab === "Event Participation" && (
                    <>
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[#202224]">Event Participation</h2>
                        </div>
                        <DataTable
                            columns={[
                                { key: "participatorName", header: "Participator Name", render: (row) => row.resident?.name || "N/A" },
                                { key: "eventTitle", header: "Event Title", render: (row) => row.event?.title || "N/A" },
                                { key: "amount", header: "Amount", className: "text-center text-[#39973D] font-bold", render: (row) => `₹ ${row.amount}` },
                                { key: "date", header: "Payment Date", render: (row) => new Date(row.createdAt).toLocaleDateString("en-GB") },
                                { key: "payment", header: "Payment Mode", className: "text-center" },
                                { key: "status", header: "Status", className: "text-center", render: (row) => <StatusBadge variant={row.status === "Paid" ? "done" : "pending"}>{row.status}</StatusBadge> },
                            ]}
                            data={eventPaymentRecords.map(item => ({ ...item, id: item._id }))}
                            isLoading={loading}
                        />
                    </>
                )}
            </div>

            <SetMaintenancePasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={handlePasswordSuccess}
            />

            <AddMaintenanceDetailModal
                open={showAddMaintenanceModal}
                onClose={() => setShowAddMaintenanceModal(false)}
                onSubmit={handleAddMaintenanceSubmit}
            />

            <ViewMaintenanceDetailsModal
                open={showViewDetailsModal}
                onClose={() => setShowViewDetailsModal(false)}
                data={
                    selectedMaintenance
                        ? {
                            fullName: selectedMaintenance.fullName,
                            date: selectedMaintenance.date,
                            avatar: selectedMaintenance.avatar,
                            wing: selectedMaintenance.unitNumber.split(" ")[0],
                            unit: selectedMaintenance.unitNumber.split(" ")[1],
                            status: selectedMaintenance.status,
                            penalty: selectedMaintenance.penalty,
                            amount: selectedMaintenance.amount,
                            paymentMode: selectedMaintenance.paymentMode,
                        }
                        : null
                }
            />

            <CreateOtherIncomeModal
                open={showCreateIncomeModal}
                onClose={() => setShowCreateIncomeModal(false)}
                onSubmit={handleIncomeSubmit}
            />

            <CreateOtherIncomeModal
                open={showEditIncomeModal}
                onClose={() => {
                    setShowEditIncomeModal(false);
                    setSelectedIncome(null);
                }}
                onSubmit={handleIncomeEdit}
                initialData={
                    selectedIncome
                        ? {
                            title: selectedIncome.title,
                            date: selectedIncome.date,
                            dueDate: selectedIncome.dueDate,
                            description: selectedIncome.description,
                            amount: selectedIncome.amountPerMember.toString(),
                        }
                        : null
                }
                isEdit
            />

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedIncome(null);
                }}
                onConfirm={handleConfirmDelete}
                title={`Delete ${selectedIncome?.title}?`}
                message="Are you sure you want to delete this?"
            />
        </div>
    );
}


