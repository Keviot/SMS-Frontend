import { X } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { announcementApi, authApi } from "../../../services/api";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[15px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Announcement" : "Create Announcement"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Announcement Title<span className="text-red-500">*</span></label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Title"
                className="h-11 rounded-lg border-gray-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Announcement Type<span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="announcementType"
                  value={formData.announcementType}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#FE512E] appearance-none bg-white text-sm font-medium transition-all"
                  required
                >
                  <option value="Community Initiatives">Community Initiatives</option>
                  <option value="Event">Event</option>
                  <option value="Notice">Notice</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#202224" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {formData.announcementType === "Event" && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Participation Amount<span className="text-red-500">*</span></label>
                <Input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter Participation Amount"
                  className="h-11 rounded-lg border-gray-200"
                  required
                />
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Announcement Date<span className="text-red-500">*</span></label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Announcement Time<span className="text-red-500">*</span></label>
                <Input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-200"
                  required
                />
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
