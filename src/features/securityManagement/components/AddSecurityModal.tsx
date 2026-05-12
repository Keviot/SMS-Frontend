import { X, Upload, Loader2, Image as ImageIcon, Trash2, Camera } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import { useState, useRef, useEffect } from "react";
import { securityGuardApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";

interface AddSecurityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
  mode?: "add" | "edit" | "view";
}

export default function AddSecurityModal({ open, onClose, onSuccess, initialData, mode = "add" }: AddSecurityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "Male",
    shift: "Day",
    shiftDate: "",
    shiftTime: "",
  });

  const [files, setFiles] = useState<{
    profileImage: File | null | string;
    uploadAadhar: File | null | string;
  }>({
    profileImage: null,
    uploadAadhar: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        fullName: initialData.name || initialData.fullName || "",
        phoneNumber: initialData.phoneNumber || "",
        email: initialData.email || "",
        gender: initialData.gender?.toLowerCase() || "Male",
        shift: initialData.shift || "Day",
        shiftDate: initialData.shiftDate ? new Date(initialData.shiftDate).toISOString().split('T')[0] : "",
        shiftTime: initialData.shiftTime || "",
      });
      setFiles({
        profileImage: initialData.profileImage || null,
        uploadAadhar: initialData.uploadAadhar || null,
      });
    } else if (open) {
      // Reset for "Add" mode
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "Male",
        shift: "Day",
        shiftDate: "",
        shiftTime: "",
      });
      setFiles({
        profileImage: null,
        uploadAadhar: null,
      });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profileImage" | "uploadAadhar") => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;
    setLoading(true);
    try {
      const profile = await authApi.getProfile();
      const user = profile.user;
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        toast.error("Society ID not found");
        setLoading(false);
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append("society", societyId);

      if (files.profileImage instanceof File) data.append("profileImage", files.profileImage);
      if (files.uploadAadhar instanceof File) data.append("uploadAadhar", files.uploadAadhar);

      if (mode === "edit" && initialData?._id) {
        await securityGuardApi.edit(initialData._id, data);
        toast.success("Security guard updated successfully");
      } else {
        await securityGuardApi.create(data);
        toast.success("Security guard created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} security guard`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-[15px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Edit Security" : mode === "view" ? "View Security" : "Add Security"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form className="p-6 space-y-5 max-h-[85vh] overflow-y-auto" onSubmit={handleSubmit}>
          {/* Photo Section */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => mode !== "view" && fileInputRef.current?.click()}
              className={`h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 ${mode !== "view" ? 'cursor-pointer hover:bg-gray-200' : ''} transition-colors overflow-hidden border border-gray-200`}
            >
              {files.profileImage ? (
                <img
                  src={files.profileImage instanceof File ? URL.createObjectURL(files.profileImage) : files.profileImage}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={20} />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              disabled={mode === "view"}
              onChange={(e) => handleFileChange(e, "profileImage")}
            />
            {mode !== "view" && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-bold text-[#5678E9] hover:underline"
              >
                {files.profileImage ? "Change Photo" : "Add Photo"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Full Name<span className="text-red-500">*</span></label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="h-11 rounded-lg border-gray-200"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Phone Number<span className="text-red-500">*</span></label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91"
                className="h-11 rounded-lg border-gray-200"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Email Address<span className="text-red-500">*</span></label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="guard@example.com"
                className="h-11 rounded-lg border-gray-200"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Gender<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#FE512E] appearance-none bg-white text-sm font-medium transition-all"
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#202224" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Shift<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#FE512E] appearance-none bg-white text-sm font-medium transition-all"
                    required
                  >
                    <option value="" disabled>Select Shift</option>
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#202224" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Shift Date<span className="text-red-500">*</span></label>
                <Input
                  name="shiftDate"
                  type="date"
                  value={formData.shiftDate}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-200"
                  required
                  disabled={mode === "view"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Shift Time<span className="text-red-500">*</span></label>
                <Input
                  name="shiftTime"
                  type="time"
                  value={formData.shiftTime}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-200"
                  required
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {/* Aadhar Upload Section */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-800">Upload Aadhar Card<span className="text-red-500">*</span></label>
              {files.uploadAadhar ? (
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg">
                    <ImageIcon size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {files.uploadAadhar instanceof File ? files.uploadAadhar.name : "Aadhar Card.pdf"}
                    </p>
                    {files.uploadAadhar instanceof File && (
                      <p className="text-xs text-gray-500">{(files.uploadAadhar.size / 1024).toFixed(1)} KB</p>
                    )}
                  </div>
                  {mode !== "view" && (
                    <button
                      type="button"
                      onClick={() => setFiles(prev => ({ ...prev, uploadAadhar: null }))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  {mode === "view" && typeof files.uploadAadhar === "string" && (
                    <a
                      href={files.uploadAadhar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#5678E9] hover:underline px-2"
                    >
                      View
                    </a>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => mode !== "view" && aadharInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-white ${mode !== "view" ? 'hover:bg-gray-50 cursor-pointer' : ''} transition-colors`}
                >
                  <ImageIcon className="text-gray-300 h-8 w-8" />
                  <div className="text-[13px] text-gray-500">
                    <span className="text-[#5678E9] font-bold">Upload a file</span> or drag and drop
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">PNG, JPG, GIF up to 10MB</div>
                  <input
                    type="file"
                    ref={aadharInputRef}
                    className="hidden"
                    disabled={mode === "view"}
                    onChange={(e) => handleFileChange(e, "uploadAadhar")}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              {mode === "view" ? "Close" : "Cancel"}
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-lg bg-[#FE512E] text-white font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : mode === "edit" ? "Save" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
