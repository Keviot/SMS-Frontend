import { cn } from "../../../lib/cn";
import Avatar from "../../../components/Avatar";
import { Eye, FileText } from "lucide-react";
import AppModal from "../../../components/modals/AppModal";

interface ResidentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: any;
}

export default function ResidentViewModal({ isOpen, onClose, resident }: ResidentViewModalProps) {
  if (!resident) return null;

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title={`View ${resident.residentStatus === "owner" ? "Owner" : "Tenant"} Details`}
      widthClassName="w-full max-w-[450px]"
      showHeaderDivider={true}
      panelClassName="max-h-[90vh] overflow-y-auto custom-scrollbar p-0"
    >
      <div className="flex-1">
          {/* Profile Section */}
          <div className="flex flex-col items-center py-8">
            <Avatar
              src={resident.avatar}
              name={resident.fullName}
              size="lg"
              className="h-28 w-28 text-3xl border-4 border-white shadow-lg"
            />
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
                { name: "Aadhar Card Front", url: resident.uploadAadharfront },
                { name: "Aadhar Card Back", url: resident.uploadAadharback },
                { name: "Address Proof", url: resident.addressProof },
                { name: "Rent Agreement", url: resident.rentAgreeMent }
              ].filter(doc => doc.url).map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors no-underline"
                >
                  <div className={cn(
                    "p-2 rounded-lg bg-blue-50 text-blue-500"
                  )}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#202224] truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400">View File</p>
                  </div>
                  <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                </a>
              ))}
              {(!resident.uploadAadharfront && !resident.uploadAadharback && !resident.addressProof && !resident.rentAgreeMent) && (
                <p className="text-xs text-gray-400 italic text-center py-2">No documents uploaded</p>
              )}
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
          <div className="px-6 pb-10 space-y-6">
            <div className="bg-[#5678E9] text-white p-3 rounded-xl flex justify-between items-center shadow-md">
              <span className="font-bold text-sm">Member Details</span>
              <span className="font-bold text-sm bg-white/20 px-3 py-0.5 rounded-full">{resident.members?.length || 0}</span>
            </div>

            {(resident.members && resident.members.length > 0) ? (
              <div className="flex flex-col gap-4">
                {resident.members.map((member: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-y-4">
                      <span className="text-sm font-semibold text-[#202224] leading-none">Full Name</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none text-right">{member.name}</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none">Phone No</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none text-right">{member.phoneNumber || "-"}</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none">Age</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none text-right">{member.age || "-"}</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none">Gender</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none text-right capitalize">{member.gender || "-"}</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none">Relation</span>
                      <span className="text-sm font-semibold text-[#202224] leading-none text-right">{member.relation || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center">No other members listed</p>
            )}
          </div>
        </div>
    </AppModal>
  );
}
