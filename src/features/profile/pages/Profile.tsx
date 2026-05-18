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
    <div className=" p-0 -m-[15px] sm:-m-[20px] lg:-m-[30px] bg-[#F6F8FB] min-h-screen font-sans">
      {/* Profile Header Background with Full Pattern */}
      <div className="h-77 w-full relative overflow-hidden bg-[#D0DAF3]">
        <img
          src={profileBG}
          alt="Profile Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="px-4 sm:px-6 -mt-60 relative z-10 pb-10">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}


          {/* Header Row (Profile Title & Edit Button) */}
          <div className="flex justify-between items-center mb-6 px-1">
            <h4 className="text-xl font-semibold text-[#202224] tracking-tight">Profile</h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <Edit2 size={18} />
                <h5 className="text-lg font-semibold">
                  Edit Profile
                </h5>
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-10 py-12 flex flex-col lg:flex-row gap-16">
              {/* Left Side: Avatar Section */}
              <div className="flex flex-col items-center lg:w-1/4 xl:w-1/5 p-0">
                <div className="relative group">
                  <div className="w-44 h-44 rounded-full p-1 border border-gray-100 overflow-hidden">
                    <img
                      src={previewUrl || (formData.profileImage ? (formData.profileImage.startsWith("http") ? formData.profileImage : `${BASE_URL}/${formData.profileImage}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-4 p-2.5 bg-white text-black rounded-full shadow-md border border-gray-100 transition-all transform hover:scale-110 active:scale-95 z-20"
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
                <h5 className="mt-5 text-lg font-medium text-[#202224] tracking-tight text-center">
                  {formData.firstName} {formData.lastName}
                </h5>
              </div>

              {/* Right Side: Form Fields */}
              <div className="flex-1">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { label: "First Name", key: "firstName", required: true },
                    { label: "Last Name", key: "lastName", required: true },
                    { label: "Phone Number", key: "phoneNumber", required: true },
                    { label: "Email Address", key: "email", required: false },
                    { label: "Select Society", key: "society", required: true },
                    { label: "Country", key: "country", required: true },
                    { label: "State", key: "state", required: true },
                    { label: "City", key: "city", required: true },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-bold text-[#202224]">
                        {field.label}{field.required && <span className="text-[#E74C3C] ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-[52px] px-5 py-3 rounded-xl border border-gray-300 focus:border-[#5678E9] focus:ring-1 focus:ring-[#5678E9] outline-none transition-all text-gray-700 font-medium disabled:bg-[#F8F9FB] disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400"
                        placeholder={`Enter ${field.label}`}
                      />
                    </div>
                  ))}

                  {isEditing && (
                    <div className="md:col-span-2 mt-8 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white px-12 py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        {isSubmitting ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
