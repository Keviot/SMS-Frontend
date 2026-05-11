import { User } from "lucide-react";
import Modal from "../../ui/Modal";

interface ResidentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: any;
}

export default function ResidentViewModal({ isOpen, onClose, resident }: ResidentViewModalProps) {
  if (!resident) return null;

  return (
    <Modal open={isOpen} title="View Resident Details" onClose={onClose} className="max-w-2xl">
      <div className="flex flex-col gap-6 p-2">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 border-2 border-orange-500/20">
            {resident.avatar ? (
              <img src={resident.avatar} alt={resident.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{resident.fullName}</h3>
            <p className="text-orange-600 font-medium">{resident.residentStatus === "owner" ? "Society Owner" : "Society Tenant"}</p>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <label className="text-sm text-gray-400 font-medium block mb-1">Unit Number</label>
            <p className="text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg inline-block min-w-[100px] text-center">
              {resident.unitNumber}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium block mb-1">Phone Number</label>
            <p className="text-gray-900 font-semibold">{resident.phoneNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium block mb-1">Unit Status</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
              resident.unitStatus === "occupied" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
            }`}>
              {resident.unitStatus}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium block mb-1">Family Members</label>
            <p className="text-gray-900 font-semibold">{resident.member}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 font-medium block mb-1">Vehicles</label>
            <p className="text-gray-900 font-semibold">{resident.vehicle}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
