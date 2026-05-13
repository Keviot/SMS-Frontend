import { useState, useEffect } from "react";
import { EyeIcon } from "../../../assets/icons/admin-dashboard-icons";
import ViewSecurityProtocolModal from "../components/ViewSecurityProtocolModal";
import { securityApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type SecurityProtocol = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
};

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
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF3FF] text-[#5678E9] transition hover:scale-105 hover:bg-[#5678E9] hover:text-white"
        >
            <span className="inline-flex size-4 items-center justify-center">
                {children}
            </span>
        </button>
    );
}

function TimeBadge({ time }: { time: string }) {
    return (
        <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-[#F6F8FB] px-3 py-1.5 text-sm font-medium leading-5 text-[#202224]">
            {time}
        </span>
    );
}

export default function ResidentSecurityProtocols() {
    const [protocols, setProtocols] = useState<SecurityProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState<SecurityProtocol | null>(null);

    // Fetch protocols on component mount
    useEffect(() => {
        fetchProtocols();
    }, []);

    const fetchProtocols = async () => {
        try {
            setLoading(true);

            // Fetch protocols - backend automatically filters by resident's society from JWT token
            const response = await securityApi.getAllSecurityProtocols();

            // Backend returns { securityProtocol: [...] }
            const protocolsData = response.securityProtocol || [];

            if (!protocolsData || protocolsData.length === 0) {
                setProtocols([]);
                setLoading(false);
                return;
            }

            // Transform backend data to frontend format
            const transformedProtocols = protocolsData.map((item: any) => ({
                id: item._id,
                title: item.title,
                description: item.description,
                date: item.date
                    ? new Date(item.date).toLocaleDateString("en-GB")
                    : new Date(item.createdAt).toLocaleDateString("en-GB"),
                time:
                    item.time ||
                    new Date(item.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }),
            }));

            setProtocols(transformedProtocols);
        } catch (error: any) {
            console.error("Error fetching protocols:", error);
            toast.error(error.message || "Failed to fetch security protocols");
            setProtocols([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (protocol: SecurityProtocol) => {
        setSelectedProtocol(protocol);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedProtocol(null);
    };

    return (
        <>
            <div className="w-full">
                <section className="rounded-[15px] bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h1 className="text-xl font-bold leading-6 text-[#202224]">
                            Security Protocols
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View security guidelines and protocols set by your society admin
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[10px] bg-white">
                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">
                                <div className="grid grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-4 py-4 text-sm font-bold leading-5 text-[#202224]">
                                    <div>Title</div>
                                    <div>Description</div>
                                    <div>Date</div>
                                    <div>Time</div>
                                    <div className="text-center">Action</div>
                                </div>

                                <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                            <span className="ml-3 text-gray-600">
                                                Loading protocols...
                                            </span>
                                        </div>
                                    ) : protocols.length === 0 ? (
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
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">
                                                No Security Protocols Available
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Your society admin hasn't created any security protocols yet.
                                            </p>
                                        </div>
                                    ) : (
                                        protocols.map((protocol) => (
                                            <div
                                                key={protocol.id}
                                                className="grid grid-cols-[1.1fr_2.2fr_1fr_1fr_0.8fr] items-center border-b border-[#E5E7EB] px-4 py-4 text-sm font-medium leading-5 text-[#202224] last:border-b-0"
                                            >
                                                <div className="truncate pr-4">{protocol.title}</div>

                                                <div className="truncate pr-6">{protocol.description}</div>

                                                <div>{protocol.date}</div>

                                                <div>
                                                    <TimeBadge time={protocol.time} />
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <ActionButton
                                                        label="View security protocol"
                                                        onClick={() => handleViewClick(protocol)}
                                                    >
                                                        <EyeIcon className="size-4" />
                                                    </ActionButton>
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

            <ViewSecurityProtocolModal
                open={showViewModal}
                onClose={handleCloseViewModal}
                data={
                    selectedProtocol
                        ? {
                            title: selectedProtocol.title,
                            description: selectedProtocol.description,
                            date: selectedProtocol.date,
                            time: selectedProtocol.time,
                        }
                        : null
                }
            />
        </>
    );
}
