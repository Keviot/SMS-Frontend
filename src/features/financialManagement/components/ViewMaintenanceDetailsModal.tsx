import { X, Wallet } from "lucide-react";
import StatusBadge from "../../../ui/StatusBadge";

interface ViewMaintenanceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    fullName: string;
    date: string;
    avatar?: string;
    wing: string;
    unit: string;
    status: "tenant" | "owner";
    penalty: number | null;
    amount: number;
    paymentMode: "online" | "cash";
  } | null;
}

export default function ViewMaintenanceDetailsModal({
  open,
  onClose,
  data,
}: ViewMaintenanceDetailsModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">View Maintenance Details</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                  {data.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.fullName}</h3>
              <p className="text-sm text-gray-500">{data.date}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Wing */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Wing</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-500">
                {data.wing}
              </span>
            </div>

            {/* Unit */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Unit</span>
              <span className="text-base font-semibold text-gray-900">{data.unit}</span>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <StatusBadge variant={data.status}>
                {data.status}
              </StatusBadge>
            </div>

            {/* Penalty */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Penalty</span>
              {data.penalty ? (
                <span className="text-base font-semibold text-[#E74C3C]">
                  ₹ {data.penalty}
                </span>
              ) : (
                <span className="text-base font-semibold text-gray-400">--</span>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Amount</span>
              <span className="text-base font-semibold text-[#39973D]">
                ₹ {data.amount}
              </span>
            </div>

            {/* Payment */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Payment</span>
              <StatusBadge variant={data.paymentMode} icon={Wallet}>
                {data.paymentMode}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
