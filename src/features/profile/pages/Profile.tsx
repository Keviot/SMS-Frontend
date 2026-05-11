import { Edit2, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import profileBG from "../../../assets/images/profileBG.png";
import { authApi, BASE_URL } from "../../../services/api";
import toast from "react-hot-toast";

interface ProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  society: string;
  country: string;
  state: string;
  city: string;
  profileImage: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    society: "",
    country: "",
    state: "",
    city: "",
    profileImage: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        if (data.user) {
          setUserId(data.user._id);
          setFormData({
            firstName: data.user.firstname || "",
            lastName: data.user.lastname || "",
            phoneNumber: data.user.phoneNumber || "",
            email: data.user.email || "",
            society: data.user.selectSociety?.[0] || "",
            country: data.user.country || "",
            state: data.user.state || "",
            city: data.user.city || "",
            profileImage: data.user.profileImage || ""
          });
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("firstname", formData.firstName);
      data.append("lastname", formData.lastName);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("email", formData.email);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("city", formData.city);
      data.append("selectSociety", formData.society);

      if (selectedFile) {
        data.append("profileImage", selectedFile);
      }

      const response = await authApi.updateProfile(userId, data);

      if (response.updatedUser) {
        setFormData(prev => ({
          ...prev,
          profileImage: response.updatedUser.profileImage
        }));
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="relative p-0 -m-[15px] sm:-m-[20px] lg:-m-[30px]">
      {/* Profile Header Background */}
      <div className="h-72 w-full relative overflow-hidden">
        <img
          src={profileBG}
          alt="Profile Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col px-6 pt-6">
          <div className="max-w-6xl mx-auto w-full">

            <div className="flex justify-between items-end mt-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Profile" : "Profile"}</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-[#FE512E] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-44 relative z-10 pb-10">
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col md:flex-row gap-8 lg:gap-16 min-h-[500px]">

          {/* Left Side: Avatar */}
          <div className="flex flex-col items-center text-center pt-8 md:w-1/4">
            <div className="relative group ">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <img
                src={previewUrl || (formData.profileImage ? (formData.profileImage.startsWith("http") ? formData.profileImage : `${BASE_URL}/${formData.profileImage}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-white transition-all duration-300 group-hover:brightness-90"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-2 p-2.5 bg-white text-black rounded-full transition-all transform hover:scale-110 active:scale-95 z-20"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 tracking-tight">{formData.firstName} {formData.lastName}</h2>
          </div>



          {/* Right Side: Form Fields */}
          <div className="flex-1 pt-8 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">First Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Society<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.society}
                  onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Country<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">State<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">City<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FE512E] focus:ring-2 focus:ring-[#FE512E]/10 outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-12 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FE512E] text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
