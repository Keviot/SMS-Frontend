import { Edit2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import profileBG from "../../assets/profileBG.png";
import { authApi } from "../../services/api";
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        city: formData.city
      };

      await authApi.updateProfile(userId, updateData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
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
                  className="flex items-center gap-2 bg-[#FE512E] text-white px-6 py-2.5 rounded-lg  font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
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
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col md:flex-row gap-16 min-h-[500px]">

          {/* Left Side: Avatar */}
          <div className="flex flex-col items-center text-center pt-8 md:w-1/4">
            <div className="relative group mr-5">
              <img
                src={formData.profileImage || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop"}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
              />
              {isEditing && (
                <button type="button" className="absolute bottom-4 right-2 p-1.5 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors">
                  <Edit2 size={14} className="text-gray-600" />
                </button>
              )}
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h2>
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
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Society<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.society}
                  onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Country<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">State<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">City<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  className="w-full h-11 px-4 py-3.5 rounded-xl border border-gray-900 focus:border-[#EE641D] outline-none transition-all text-gray-800 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
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
