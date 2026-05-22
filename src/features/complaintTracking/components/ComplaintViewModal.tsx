import Avatar from "../../../components/Avatar";
import AppModal from "../../../components/modals/AppModal";

interface ComplaintViewData {
    complainerName: string;
    initials: string;
    date: string;
    complaintName: string;
    description: string;
    wing: string;
    unit: string;
    priority: "High" | "Medium" | "Low";
    status: "Open" | "Pending" | "Closed";
}

interface ComplaintViewModalProps {
    open: boolean;
    onClose: () => void;
    data: ComplaintViewData | null;
}

function priorityClass(priority: string) {
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

function statusClass(status: string) {
    switch (status) {
        case "Closed":
            return "bg-[#E5F4E8] text-[#39973D]";
        case "Open":
            return "bg-[#EEF2FF] text-[#5678E9]";
        case "Pending":
        default:
            return "bg-[#FFF7E6] text-[#F0A000]";
    }
}

export default function ComplaintViewModal({
    open,
    onClose,
    data,
}: ComplaintViewModalProps) {
    if (!open || !data) return null;

    return (
        <AppModal
            open={open}
            onClose={onClose}
            title="View Complaint"
            widthClassName="max-w-[418px]"
        >
            <div className="flex flex-col gap-5 pt-1">
                {/* Avatar + Name + Date */}
                <div className="mb-5 flex items-center gap-4">
                    <Avatar
                        name={data.complainerName}
                        className="size-14"
                        size="lg"
                    />

                    <div>
                        <h3 className="text-base font-semibold leading-6 text-[#202224]">
                            {data.complainerName}
                        </h3>
                        <p className="mt-0.5 text-sm font-normal text-[#A7A7A7]">{data.date}</p>
                    </div>
                </div>

                {/* Request Name */}
                <div className="mb-4">
                    <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">
                        Request Name
                    </p>
                    <p className="text-sm font-semibold leading-5 text-[#202224]">
                        {data.complaintName}
                    </p>
                </div>

                {/* Description */}
                <div className="mb-5">
                    <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">Description</p>
                    <p className="text-sm font-normal leading-5 text-[#4F4F4F]">
                        {data.description}
                    </p>
                </div>

                {/* Wing, Unit, Priority, Status */}
                <div className="grid grid-cols-4 gap-3">
                    <div>
                        <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">Wing</p>
                        <div className="flex items-center justify-start">
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#F1F6FF] text-sm font-bold text-[#5678E9]">
                                {data.wing}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">Unit</p>
                        <p className="text-left text-sm font-semibold leading-5 text-[#202224]">
                            {data.unit}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">Priority</p>
                        <div className="flex items-center justify-start">
                            <span
                                className={`inline-flex min-w-[70px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                                    data.priority
                                )}`}
                            >
                                {data.priority}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-normal leading-4 text-[#A7A7A7]">Status</p>
                        <div className="flex items-center justify-start">
                            <span
                                className={`inline-flex min-w-[70px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                    data.status
                                )}`}
                            >
                                {data.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppModal>
    );
}
