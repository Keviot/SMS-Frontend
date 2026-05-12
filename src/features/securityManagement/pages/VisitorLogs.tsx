import { useState, useEffect } from "react";
import { securityApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type VisitorLog = {
    id: string;
    visitorName: string;
    phoneNumber: string;
    date: string;
    wing: string;
    unitNumber: string;
    time: string;
    avatar: string;
};

export default function VisitorLogs() {
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch visitor logs on component mount
    useEffect(() => {
        fetchVisitorLogs();
    }, []);

    const fetchVisitorLogs = async () => {
        try {
            setLoading(true);

            // Fetch visitor logs - backend uses req.user.society from auth token
            const response = await securityApi.getAllVisitors();

            // Backend returns { data: [...] }
            const visitorsData = response.data || [];

            if (!visitorsData || visitorsData.length === 0) {
                setLogs([]);
                setLoading(false);
                return;
            }

            // Transform backend data to frontend format
            const transformedLogs = visitorsData.map((item: any) => ({
                id: item._id,
                visitorName: item.name,
                phoneNumber: item.phoneNumber,
                date: item.date ? new Date(item.date).toLocaleDateString("en-GB") : new Date(item.createdAt).toLocaleDateString("en-GB"),
                wing: item.wing,
                unitNumber: item.unit,
                time: item.time || new Date(item.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
                avatar: item.avatar || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
            }));

            setLogs(transformedLogs);
        } catch (error: any) {
            console.error("Error fetching visitor logs:", error);
            toast.error(error.message || "Failed to fetch visitor logs");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full">
                <section className="rounded-[15px] bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h1 className="text-xl font-bold leading-6 text-[#202224]">
                            Visitor Logs
                        </h1>
                    </div>

                    <div className="overflow-hidden rounded-[10px] bg-white">
                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">
                                <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-4 py-4 text-sm font-bold leading-5 text-[#202224]">
                                    <div>Visitor Name</div>
                                    <div>Phone Number</div>
                                    <div>Date</div>
                                    <div>Unit Number</div>
                                    <div className="text-center">Time</div>
                                </div>

                                <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                            <span className="ml-3 text-gray-600">Loading visitor logs...</span>
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <p className="text-gray-500">No visitor logs found</p>
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={log.avatar}
                                                        alt={log.visitorName}
                                                        className="size-9 shrink-0 rounded-full object-cover"
                                                    />
                                                    <span className="truncate">{log.visitorName}</span>
                                                </div>

                                                <div className="text-[#4F4F4F]">{log.phoneNumber}</div>

                                                <div className="text-[#4F4F4F]">{log.date}</div>

                                                <div className="flex items-center gap-2">
                                                    <span className="flex size-6 items-center justify-center rounded-full bg-[#F1F6FF] text-xs font-bold text-[#5678E9]">
                                                        {log.wing}
                                                    </span>
                                                    <span>{log.unitNumber}</span>
                                                </div>

                                                <div className="flex justify-center">
                                                    <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-[#F6F8FB] px-3 py-1.5 text-sm font-medium leading-5 text-[#202224]">
                                                        {log.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
