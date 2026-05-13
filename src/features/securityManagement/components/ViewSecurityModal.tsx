import { X, Sun, Moon, User as UserIcon, Clock } from "lucide-react";
import Avatar from "../../../components/Avatar";

interface ViewSecurityModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export default function ViewSecurityModal({ open, onClose, data }: ViewSecurityModalProps) {
  if (!open || !data) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">View Security Guard Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0">
              <Avatar
                src={data.profileImage}
                name={data.name || `${data.firstname} ${data.lastname}`}
                size="md"
                className="h-16 w-16"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{data.name || `${data.firstname} ${data.lastname}`}</h3>
              <p className="text-sm font-medium text-gray-400">{formatDate(data.shiftDate)}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2 text-center">
              <span className="text-[12px] font-medium text-gray-400 block uppercase tracking-wider">Select Shift</span>
              <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${
                data.shift?.toLowerCase() === 'day' ? 'bg-[#FFF9E7] text-[#FFB302]' : 'bg-[#313131] text-white'
              }`}>
                {data.shift?.toLowerCase() === 'day' ? <Sun size={14} /> : <Moon size={14} />}
                {data.shift}
              </span>
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[12px] font-medium text-gray-400 block uppercase tracking-wider">Shift Time</span>
              <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-[#F6F8FB] text-gray-700">
                <Clock size={14} className="text-gray-400" />
                {data.shiftTime}
              </span>
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[12px] font-medium text-gray-400 block uppercase tracking-wider">Gender</span>
              <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${
                data.gender?.toLowerCase() === 'male' ? 'bg-[#F1F4FF] text-[#5678E9]' : 'bg-[#FFF1F8] text-[#FF71BA]'
              }`}>
                <UserIcon size={14} />
                <span className="capitalize">{data.gender}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
