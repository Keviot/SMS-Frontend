import { X } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import FormDatePicker from "../../../ui/FormDatePicker";
import FormTimePicker from "../../../ui/FormTimePicker";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { announcementApi, authApi } from "../../../services/api";
import FormSelect from "../../../ui/FormSelect";

interface CreateAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  announcement?: any; // For edit mode
  onSuccess?: () => void;
}

export default function CreateAnnouncementModal({ open, onClose, announcement, onSuccess }: CreateAnnouncementModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    announcementType: "Community Initiatives",
    date: "",
    time: "",
    amount: "",
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        description: announcement.description || "",
        announcementType: Array.isArray(announcement.announcementType) ? announcement.announcementType[0] : (announcement.announcementType || "Notice"),
        date: announcement.date ? new Date(announcement.date).toISOString().split('T')[0] : "",
        time: announcement.time || "",
        amount: announcement.amount || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        announcementType: "Community Initiatives",
        date: "",
        time: "",
        amount: "",
      });
    }
  }, [announcement, open]);

  if (!open) return null;

  const isEdit = Boolean(announcement);

  const announcementTypeOptions = [
    { label: "Community Initiatives", value: "Community Initiatives" },
    { label: "Event", value: "Event" },
    { label: "Notice", value: "Notice" },
  ];

  const isFormFilled =
    formData.title.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.announcementType !== "" &&
    formData.date !== "" &&
    formData.time !== "";

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Defensive check: ensure we don't double wrap if it's already an array
    const actualType = Array.isArray(formData.announcementType)
      ? formData.announcementType[0]
      : formData.announcementType;

    const dataToSubmit: any = {
      ...formData,
      announcementType: [actualType]
    };

    if (actualType !== "Event") {
      delete dataToSubmit.amount;
    }
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
        await announcementApi.edit(announcement._id, { ...dataToSubmit, society: societyId });
        toast.success("Announcement updated successfully");
      } else {
        await announcementApi.create({ ...dataToSubmit, society: societyId });
        toast.success("Announcement created successfully");
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#F4F4F4] px-4 py-3">
          <h2 className="text-base font-semibold text-[#202224]">{isEdit ? "Edit Announcement" : "Add Announcement"}</h2>

        </div>

        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto sm:overflow-visible sm:max-h-none">
          <form className="px-4 py-4 space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#202224]">Announcement Title<span className="text-red-500">*</span></label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Title"
                  className="h-10 rounded-lg border border-[#D8D8D8] px-3 text-xs font-medium placeholder:text-[#A7A7A7] focus:border-[#FE512E]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#202224]">Announcement Type<span className="text-red-500">*</span></label>
                <div className="relative">
                  <FormSelect
                    value={formData.announcementType}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, announcementType: value }))
                    }
                    options={announcementTypeOptions}
                    placeholder="Select Announcement Type"
                    className="w-full"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#202224" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {formData.announcementType === "Event" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#202224]">Participation Amount<span className="text-red-500">*</span></label>
                  <Input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter Participation Amount"
                    className="h-10 rounded-lg border border-[#D8D8D8] px-3 text-xs font-medium placeholder:text-[#A7A7A7] focus:border-[#FE512E]"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#202224]">Description<span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter Description"
                  className="h-20 w-full resize-none rounded-lg border border-[#D8D8D8] px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-[#A7A7A7] focus:border-[#FE512E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#202224]">Announcement Date<span className="text-red-500">*</span></label>
                  <FormDatePicker
                    value={formData.date}
                    onChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
                    placeholder="Select date"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#202224]">Announcement Time<span className="text-red-500">*</span></label>
                  <FormTimePicker
                    value={formData.time}
                    onChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
                    placeholder="Select time"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-lg border border-[#D8D8D8] bg-white text-sm font-semibold text-[#202224] transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 h-12 rounded-lg font-bold transition-all disabled:opacity-50 ${isFormFilled
                  ? "bg-linear-to-r from-[#FE512E] to-[#F09619] text-white shadow-lg hover:opacity-90 active:scale-[0.98]"
                  : "bg-[#F6F8FB] text-[#202224] shadow-none"
                  }`}
              >
                {loading ? "Processing..." : (isEdit ? "Save" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
