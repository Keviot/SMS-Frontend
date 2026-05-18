import { X } from "lucide-react";
import Input from "../../../ui/Input";
import FormSelect from "../../../ui/FormSelect";
import FormDatePicker from "../../../ui/FormDatePicker";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { facilityApi, authApi } from "../../../services/api";

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
    remindBefore: "4",
  });

  // Options for the remind before select
  const remindBeforeOptions = [
    { label: "1-day", value: "1" },
    { label: "2-day", value: "2" },
    { label: "3-day", value: "3" },
    { label: "4-day", value: "4" },
  ];

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || "",
        description: facility.description || "",
        scheduleServiceDate: facility.scheduleServiceDate ? new Date(facility.scheduleServiceDate).toISOString().split('T')[0] : "",
        remindBefore: String(facility.remindBefore || 4),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        scheduleServiceDate: "",
        remindBefore: "4",
      });
    }
  }, [facility, open]);

  if (!open) return null;

  const isEdit = Boolean(facility);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, scheduleServiceDate: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, remindBefore: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch profile to get society ID
      const profile = await authApi.getProfile();
      const user = profile.user;

      // Get society ID - handle direct field or societies array for admins
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        toast.error("Society ID not found. Please ensure your account is linked to a society.");
        setLoading(false);
        return;
      }

      if (isEdit) {
        await facilityApi.edit(facility._id, { ...formData, remindBefore: Number(formData.remindBefore), society: societyId });
        toast.success("Facility updated successfully");
      } else {
        await facilityApi.add({ ...formData, remindBefore: Number(formData.remindBefore), society: societyId });
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
      <div className="relative w-full max-w-[410px] rounded-[10px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex h-[64px] items-center justify-between border-b border-gray-100 px-6">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Facility" : "Create Facility"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
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
                className="h-[88px] w-full resize-none rounded-lg border border-gray-200 p-3 text-sm font-medium outline-none transition-all focus:border-[#FE512E]" required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Schedule Service Date<span className="text-red-500">*</span></label>
              <FormDatePicker
                value={formData.scheduleServiceDate}
                onChange={handleDateChange}
                placeholder="Select date"
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Remind Before<span className="text-red-500">*</span></label>
              <FormSelect
                value={formData.remindBefore}
                onChange={handleSelectChange}
                options={remindBeforeOptions}
                placeholder="Select reminder period"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[51px] rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[51px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
              {loading ? "Processing..." : (isEdit ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
