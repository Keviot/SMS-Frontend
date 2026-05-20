import { useState, useEffect, useMemo } from "react";
import { securityApi, authApi, residentApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2, Plus, ChevronDown } from "lucide-react";
import Button from "../../../ui/Button";
import AddVisitorModal from "../../../components/security panel/AddVisitorModal";
import { useAuth } from "../../../context/AuthContext";


type VisitorLog = {
    id: string;
    visitorName: string;
    phoneNumber: string;
    rawDate: string;
    date: string;
    wing: string;
    unitNumber: string;
    time: string;
};
type unitOption = {
    wing: string;
    unit: string;
}
type FilterType = "Today" | "Week" | "Month" | "All";

export default function VisitorLogs() {
    const { role } = useAuth();
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [societyId, setSocietyId] = useState("");

    const [selectedFilter, setSelectedFilter] = useState<FilterType>("Week");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filterOptions: FilterType[] = ["Today", "Week", "Month", "All"];
    const [unitOption, setUnitOption] = useState<unitOption[]>([]);
    const fetchUnits = async () => {
        try {
            const response = await residentApi.getAll();
            const residentsData = response || [];

            const options: unitOption[] = residentsData
                .map((item: any) => ({
                    wing: item.wing,
                    unit: item.unit,
                }))
                .filter((item: unitOption) => item.wing && item.unit);

            const uniqueOptions = Array.from(
                new Map(
                    options.map((item) => [`${item.wing}-${item.unit}`, item])
                ).values()
            );

            setUnitOption(uniqueOptions);
        } catch (error) {
            console.error("Failed to fetch unit options:", error);
            setUnitOption([]);
        }
    };
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authApi.getProfile();

                if (profile.user?.society) {
                    setSocietyId(profile.user.society);
                } else if (profile.user?.societies?.length > 0) {
                    setSocietyId(profile.user.societies[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
        fetchVisitorLogs();
        fetchUnits();
    }, []);

    const fetchVisitorLogs = async () => {
        try {
            setLoading(true);

            const response = await securityApi.getAllVisitors();
            const visitorsData = response.data || [];

            const transformedLogs: VisitorLog[] = visitorsData.map((item: any) => {
                const visitorDate = item.date || item.createdAt;

                return {
                    id: item._id,
                    visitorName: item.name || "Unknown",
                    phoneNumber: item.phoneNumber || "-",
                    rawDate: visitorDate,
                    date: visitorDate
                        ? new Date(visitorDate).toLocaleDateString("en-GB")
                        : "-",
                    wing: item.wing || "-",
                    unitNumber: item.unit || "-",
                    time:
                        item.time ||
                        new Date(item.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        }),
                };
            });

            setLogs(transformedLogs);
        } catch (error: any) {
            console.error("Error fetching visitor logs:", error);
            toast.error(error.message || "Failed to fetch visitor logs");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        const today = new Date();

        return logs.filter((log) => {
            if (selectedFilter === "All") return true;

            const logDate = new Date(log.rawDate);

            if (Number.isNaN(logDate.getTime())) return false;

            const todayStart = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            const logDayStart = new Date(
                logDate.getFullYear(),
                logDate.getMonth(),
                logDate.getDate()
            );

            if (selectedFilter === "Today") {
                return logDayStart.getTime() === todayStart.getTime();
            }

            if (selectedFilter === "Week") {
                const sevenDaysAgo = new Date(todayStart);
                sevenDaysAgo.setDate(todayStart.getDate() - 6);

                return logDayStart >= sevenDaysAgo && logDayStart <= todayStart;
            }

            if (selectedFilter === "Month") {
                return (
                    logDate.getMonth() === today.getMonth() &&
                    logDate.getFullYear() === today.getFullYear()
                );
            }

            return true;
        });
    }, [logs, selectedFilter]);

    const getInitial = (name: string) => {
        return name?.trim()?.charAt(0)?.toUpperCase() || "?";
    };

    return (
        <div className="w-full">
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#F4F4F4]">
                <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold text-[#202224]">
                        Visitor Tracking
                    </h1>

                    <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen((prev) => !prev)}
                                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#D3D3D3] bg-white px-4 py-2.5 text-sm font-semibold text-[#202224] transition-all hover:bg-gray-50 sm:w-auto sm:justify-start"
                            >
                                {selectedFilter}
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isFilterOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-full sm:w-36 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setSelectedFilter(option);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#FFF4EF] ${selectedFilter === option
                                                ? "bg-[#FFF4EF] text-[#FE512E]"
                                                : "text-[#202224]"
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {role !== "admin" && (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#FE512E] to-[#F09633] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(255,107,53,0.2)] transition-all hover:shadow-[0_6px_20px_rgba(255,107,53,0.3)] whitespace-nowrap"
                            >
                                <Plus size={18} />
                                Add Visitor details
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-[#F1F4FF] text-left">
                                <th className="rounded-tl-xl px-6 py-4 text-sm font-bold text-[#202224]">
                                    Visitor Name
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-[#202224]">
                                    Phone Number
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-[#202224]">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-[#202224]">
                                    Unit Number
                                </th>
                                <th className="rounded-tr-xl px-6 py-4 text-sm font-bold text-[#202224]">
                                    Time
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F4F4F4]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
                                            <span className="text-sm font-medium text-[#A7A7A7]">
                                                Loading visitor logs...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-sm font-medium text-[#A7A7A7]">
                                            No visitor logs found
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="transition-colors hover:bg-[#F9F9F9]"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-sm font-bold text-[#202224] shadow-sm">
                                                    {getInitial(log.visitorName)}
                                                </div>

                                                <span className="text-sm font-semibold text-[#202224]">
                                                    {log.visitorName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-[#4F4F4F]">
                                            {log.phoneNumber}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-[#4F4F4F]">
                                            {log.date}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F6FF] text-[10px] font-bold text-[#5678E9]">
                                                    {log.wing}
                                                </span>

                                                <span className="text-sm font-semibold text-[#4F4F4F]">
                                                    {log.unitNumber}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center rounded-full bg-[#F6F8FB] px-4 py-1.5 text-xs font-semibold text-[#202224]">
                                                {log.time}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <AddVisitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchVisitorLogs}
                societyId={societyId}
                unitOptions={unitOption}
            />
        </div>
    );
}