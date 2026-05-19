import { X, Upload, Loader2, Image as ImageIcon, Trash2, Camera } from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import FormSelect from "../../../ui/FormSelect";
import FormDatePicker from "../../../ui/FormDatePicker";
import FormTimePicker from "../../../ui/FormTimePicker";
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
    gender: "",
    shift: "",
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

  // Options for FormSelect components
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const shiftOptions = [
    { label: "Day", value: "Day" },
    { label: "Night", value: "Night" },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        fullName: initialData.name || initialData.fullName || "",
        phoneNumber: initialData.phoneNumber || "",
        email: initialData.email || "",
        gender: initialData.gender?.toLowerCase() || "",
        shift: initialData.shift || "",
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
        gender: "",
        shift: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shiftDate: value }));
  };

  const handleTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shiftTime: value }));
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div className="relative flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl overflow-visible">
        <div className="flex items-center justify-between border-b border-[#F4F4F4] px-4 py-3">
          <h2 className="text-base font-semibold text-[#202224]">
            {mode === "edit" ? "Edit Security" : mode === "view" ? "View Security" : "Add Security"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-[#A7A7A7] hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>

        <form
          className="px-4 py-4 space-y-3 max-h-[calc(100vh-7rem)] overflow-y-auto lg:max-h-none lg:overflow-visible"
          onSubmit={handleSubmit}
        >
          {/* Photo Section */}
          <div className="flex items-center gap-5">
            <div
              onClick={() => mode !== "view" && fileInputRef.current?.click()}
              className="flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#D9D9D9] text-white"
            >
              {files.profileImage ? (
                <img
                  src={files.profileImage instanceof File ? URL.createObjectURL(files.profileImage) : files.profileImage}
                  alt="Preview"
                  className="size-full object-cover"
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Full Name<span className="text-[#FE512E]">*</span>
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="h-11 rounded-xl border-[#D9D9D9] text-sm font-medium text-[#202224] placeholder:text-[#A7A7A7] focus:border-[#202224]"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Phone Number<span className="text-[#FE512E]">*</span>
              </label>
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91"
                className="h-11 rounded-xl border-[#D9D9D9] text-sm font-medium text-[#202224] placeholder:text-[#A7A7A7] focus:border-[#202224]"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Email Address<span className="text-[#FE512E]">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="guard@example.com"
                className="h-11 rounded-xl border-[#D9D9D9] text-sm font-medium text-[#202224] placeholder:text-[#A7A7A7] focus:border-[#202224]"
                required
                disabled={mode === "view"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-5 text-[#202224]">
                  Gender<span className="text-[#FE512E]">*</span>
                </label>
                <FormSelect
                  value={formData.gender}
                  onChange={(value) => handleSelectChange("gender", value)}
                  options={genderOptions}
                  placeholder="Select Gender"
                  disabled={mode === "view"}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-5 text-[#202224]">
                  Shift<span className="text-[#FE512E]">*</span>
                </label>
                <FormSelect
                  value={formData.shift}
                  onChange={(value) => handleSelectChange("shift", value)}
                  options={shiftOptions}
                  placeholder="Select Shift"
                  disabled={mode === "view"}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-5 text-[#202224]">
                  Shift Date<span className="text-[#FE512E]">*</span>
                </label>
                <FormDatePicker
                  value={formData.shiftDate}
                  onChange={handleDateChange}
                  placeholder="Select date"
                  disabled={mode === "view"}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-5 text-[#202224]">
                  Shift Time<span className="text-[#FE512E]">*</span>
                </label>
                <FormTimePicker
                  value={formData.shiftTime}
                  onChange={handleTimeChange}
                  placeholder="Select time"
                  disabled={mode === "view"}
                  className="w-full"
                />
              </div>
            </div>

            {/* Aadhar Upload Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Upload Aadhar Card<span className="text-[#FE512E]">*</span>
              </label>
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
                  <ImageIcon className="size-7 text-[#A7A7A7]" />
                  <div className="mt-2 text-xs font-semibold text-[#202224]">
                    <span className="text-[#5678E9]">Upload a file</span> or drag and drop
                  </div>
                  <div className="mt-1 text-[0.65rem] font-medium text-[#A7A7A7]">PNG, JPG, GIF up to 10MB</div>
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

          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl border border-[#D9D9D9] bg-white text-sm font-semibold text-[#202224] hover:bg-gray-50 transition-colors"
            >
              {mode === "view" ? "Close" : "Cancel"}
            </button>
            {mode !== "view" && (
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : mode === "edit" ? "Save" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
