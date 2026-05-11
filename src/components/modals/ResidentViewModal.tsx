import { User, ChevronLeft, FileText, Eye } from "lucide-react";
import { cn } from "../../lib/cn";

interface ResidentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: any;
}

export default function ResidentViewModal({ isOpen, onClose, resident }: ResidentViewModalProps) {
  if (!resident) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[450px] bg-white z-[110] shadow-2xl transition-transform duration-300 transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            View {resident.residentStatus === "owner" ? "Owner" : "Tenant"} Details
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Profile Section */}
          <div className="flex flex-col items-center py-8">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg bg-gray-100">
              {resident.avatar ? (
                <img src={resident.avatar} alt={resident.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                  <User size={50} />
                </div>
              )}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">{resident.fullName}</h3>
            <p className="text-gray-500 font-medium">{resident.email || "No Email Provided"}</p>
          </div>

          {/* Details List */}
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-4">

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#202224] leading-none">Wing</span>
                <span className="text-sm font-semibold text-[#202224] leading-none">{resident.unitNumber?.split(" ")[0] || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#202224] leading-none">Unit</span>
                <span className="text-sm font-semibold text-[#202224] leading-none">{resident.unitNumber?.split(" ")[1] || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#202224] leading-none">Age</span>
                <span className="text-sm font-semibold text-[#202224] leading-none">{resident.age || "20"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#202224] leading-none">Gender</span>
                <span className="text-sm font-semibold text-[#202224] leading-none capitalize">{resident.gender || "Male"}</span>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold text-[#202224] leading-none mb-4">Document</h4>
            <div className="flex flex-col gap-3">
              {[
                { name: "Adharcard Front Side.JPG", size: "3.5 MB", type: "image" },
                { name: "Address Proof Front Side.PDF", size: "3.5 MB", type: "pdf" }
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    "p-2 rounded-lg",
                    doc.type === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  )}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#202224] truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400">{doc.size}</p>
                  </div>
                  <Eye size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Owner Details Section - Only for Tenants */}
          {resident.residentStatus === "tenant" && (
            <div className="px-6 pb-6">
              <div className="bg-[#5678E9] text-white p-3 rounded-t-xl">
                <span className="font-bold text-sm">Owner Details</span>
              </div>
              <div className="border border-t-0 border-gray-100 rounded-b-xl p-4 bg-white">
                <div className="grid grid-cols-2 gap-y-4">
                  <span className="text-sm font-semibold text-[#202224] leading-none">Name</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">{resident.ownerName || "-"}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Phone</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">{resident.ownerPhone || "-"}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Address</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right truncate pl-4">{resident.ownerAddress || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Member Section */}
          <div className="px-6 pb-10">
            <div className="bg-[#5678E9] text-white p-3 rounded-t-xl flex justify-between items-center">
              <span className="font-bold text-sm">Member Counting</span>
              <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded-lg">{resident.member || "0"}</span>
            </div>
            <div className="border border-t-0 border-gray-100 rounded-b-xl overflow-hidden">
              <div className="p-4 flex flex-col gap-4 bg-white">
                <div className="grid grid-cols-2 gap-y-4">
                  <span className="text-sm font-semibold text-[#202224] leading-none">First Name</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">{resident.fullName}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Phone No</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">{resident.phoneNumber}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Age</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">{resident.age || "20"}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Gender</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right capitalize">{resident.gender || "Male"}</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none">Relation</span>
                  <span className="text-sm font-semibold text-[#202224] leading-none text-right">Self</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
