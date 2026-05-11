import { X } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";

interface AddVisitorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddVisitorModal({ open, onClose }: AddVisitorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add Visitor Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Visitor Name<span className="text-red-500">*</span></label>
              <Input 
                placeholder="Enter Name"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number<span className="text-red-500">*</span></label>
              <Input 
                placeholder="Enter Phone Number"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Wing<span className="text-red-500">*</span></label>
                <Input 
                  placeholder="A"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Unit<span className="text-red-500">*</span></label>
                <Input 
                  placeholder="1001"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date<span className="text-red-500">*</span></label>
              <Input 
                type="date"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Time<span className="text-red-500">*</span></label>
              <Input 
                type="time"
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-12 rounded-xl bg-[#FE512E] text-white font-bold shadow-lg hover:opacity-90"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
