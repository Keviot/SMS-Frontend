import { X } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { facilityApi } from "../../../services/api";

interface CreateFacilityModalProps {
  open: boolean;
  onClose: () => void;
  facility?: any; // For edit mode
  onSuccess?: () => void;
}

export default function CreateFacilityModal({ open, onClose, facility, onSuccess }: CreateFacilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scheduleServiceDate: "",
    remindBefore: 4,
  });

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || "",
        description: facility.description || "",
        scheduleServiceDate: facility.scheduleServiceDate ? new Date(facility.scheduleServiceDate).toISOString().split('T')[0] : "",
        remindBefore: Number(facility.remindBefore) || 4,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        scheduleServiceDate: "",
        remindBefore: 4,
      });
    }
  }, [facility, open]);

  if (!open) return null;

  const isEdit = Boolean(facility);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "remindBefore" ? Number(value) : value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, remindBefore: Number(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await facilityApi.edit(facility._id, formData);
        toast.success("Facility updated successfully");
      } else {
        await facilityApi.add(formData);
        toast.success("Facility created successfully");
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[15px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Facility" : "Create Facility"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Facility Name<span className="text-red-500">*</span></label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="h-11 rounded-lg border-gray-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Description<span className="text-red-500">*</span></label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Description"
                className="w-full h-24 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#FE512E] transition-all resize-none text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Schedule Service Date<span className="text-red-500">*</span></label>
              <Input 
                name="scheduleServiceDate"
                type="date"
                value={formData.scheduleServiceDate}
                onChange={handleChange}
                className="h-11 rounded-lg border-gray-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Remind Before<span className="text-red-500">*</span></label>
              <div className="relative">
                <select 
                  name="remindBefore"
                  value={formData.remindBefore}
                  onChange={handleSelectChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#FE512E] appearance-none bg-white text-sm font-medium transition-all"
                >
                  <option value={1}>1-day</option>
                  <option value={2}>2-day</option>
                  <option value={3}>3-day</option>
                  <option value={4}>4-day</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#202224" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-lg bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Processing..." : (isEdit ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
