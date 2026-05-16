import { useState } from "react";
import { Camera, ChevronDown, ChevronUp, Trash2, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Button from "../../../ui/Button";
import FormInput from "../../../ui/FormInput";
import Select from "../../../ui/Select";
import UploadBox from "../../../ui/UploadBox";
import { cn } from "../../../lib/cn";
import { residentApi, authApi } from "../../../services/api";
import toast from "react-hot-toast";

export default function ResidentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"owner" | "tenant">("owner");
  const [memberCount, setMemberCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    age: "",
    gender: "",
    wing: "",
    unit: "",
    relation: "",
    // Owner Details (for Tenant tab)
    ownerName: "",
    ownerPhone: "",
    ownerAddress: "",
    unitStatus: "Occupied",
  });

  const [members, setMembers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...members];
    if (!updatedMembers[index]) updatedMembers[index] = {};
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const handleVehicleChange = (index: number, field: string, value: string) => {
    const updatedVehicles = [...vehicles];
    if (!updatedVehicles[index]) updatedVehicles[index] = {};
    updatedVehicles[index][field] = value;
    setVehicles(updatedVehicles);
  };

  useEffect(() => {
    const fetchResident = async () => {
      if (!id) return;
      try {
        const residents = await residentApi.getAll();
        const resident = residents.find((r: any) => r._id === id);
        if (resident) {
          setFormData({
            name: resident.name || "",
            phoneNumber: resident.phoneNumber || "",
            email: resident.email || "",
            age: resident.age?.toString() || "",
            gender: resident.gender || "",
            wing: resident.wing || "",
            unit: resident.unit || "",
            relation: resident.relation || "",
            ownerName: resident.ownerName || "",
            ownerPhone: resident.ownerPhone || "",
            ownerAddress: resident.ownerAddress || "",
            unitStatus: resident.unitStatus || "Occupied",
          });
          setActiveTab(resident.residentStatus?.toLowerCase() === "tenant" ? "tenant" : "owner");
          setMembers(resident.members || []);
          setMemberCount(resident.members?.length || 0);
          setVehicles(resident.vehicles || []);
          setVehicleCount(resident.vehicles?.length || 0);

          // Set existing file previews
          setPreviews({
            profileImage: resident.profileImage || "",
            uploadAadharfront: resident.uploadAadharfront || "",
            uploadAadharback: resident.uploadAadharback || "",
            addressProof: resident.addressProof || "",
            rentAgreeMent: resident.rentAgreeMent || "",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch resident details");
      }
    };
    fetchResident();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Fetch profile to get society ID
      const profile = await authApi.getProfile();
      const user = profile.user;

      // Get society ID - handle direct field or societies array for admins
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        toast.error("Society ID not found in profile. Please ensure your account is linked to a society.");
        return;
      }

      // Build FormData to handle file uploads
      const formDataToSend = new FormData();

      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      formDataToSend.append("society", societyId);
      formDataToSend.append("residentStatus", activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      formDataToSend.append("memberCount", memberCount.toString());

      // Append arrays as JSON strings - filter out empty items
      const cleanedMembers = members.slice(0, memberCount).filter(m => m && Object.keys(m).length > 0 && m.name);
      const cleanedVehicles = vehicles.slice(0, vehicleCount).filter(v => v && Object.keys(v).length > 0 && v.vehicleName);

      formDataToSend.append("members", JSON.stringify(cleanedMembers));
      formDataToSend.append("vehicles", JSON.stringify(cleanedVehicles));

      // Append actual files
      if (files.profileImage) formDataToSend.append("profileImage", files.profileImage);
      if (files.uploadAadharfront) formDataToSend.append("uploadAadharfront", files.uploadAadharfront);
      if (files.uploadAadharback) formDataToSend.append("uploadAadharback", files.uploadAadharback);
      if (files.addressProof) formDataToSend.append("addressProof", files.addressProof);
      if (files.rentAgreeMent) formDataToSend.append("rentAgreeMent", files.rentAgreeMent);

      if (id) {
        await residentApi.edit(id, formDataToSend);
        toast.success("Resident updated successfully");
      } else {
        await residentApi.create(formDataToSend);
        toast.success("Resident created successfully");
      }
      navigate("/resident-management");
    } catch (error: any) {
      toast.error(error.message || "Failed to create resident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const requiredFields = ["name", "phoneNumber", "age", "gender", "wing", "unit", "relation"];
    const basicFieldsValid = requiredFields.every(field => formData[field as keyof typeof formData]?.trim());
    
    if (activeTab === "tenant") {
      const tenantFieldsValid = ["ownerName", "ownerPhone", "ownerAddress"].every(field => formData[field as keyof typeof formData]?.trim());
      return basicFieldsValid && tenantFieldsValid;
    }
    
    return basicFieldsValid;
  };

  const memberOptions = Array.from({ length: 11 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
  const vehicleOptions = Array.from({ length: 11 }, (_, i) => ({ label: `${i}`, value: `${i}` }));

  return (
    <div className="flex flex-col gap-0">
      {/* Tabs */}
      <div className="flex gap-0">
        <button
          onClick={() => setActiveTab("owner")}
          className={cn(
            "h-12 w-32 rounded-t-xl text-sm font-bold transition-all",
            activeTab === "owner"
              ? "bg-gradient-to-r from-[#FF512E] to-[#FD9A36] text-white shadow-md"
              : "bg-white text-[#202224] hover:bg-gray-50 border-b-2 border-[#FF512E]"
          )}
        >
          Owner
        </button>
        <button
          onClick={() => setActiveTab("tenant")}
          className={cn(
            "h-12 w-32 rounded-t-xl text-sm font-bold transition-all",
            activeTab === "tenant"
              ? "bg-gradient-to-r from-[#FF512E] to-[#FD9A36] text-white shadow-md"
              : "bg-white text-[#202224] hover:bg-gray-50 border-b-2 border-[#FF512E]"
          )}
        >
          Tenant
        </button>
      </div>

      {/* Main Details Card */}
      <div className="rounded-b-2xl rounded-tr-2xl bg-white p-8 shadow-sm border border-[#F4F4F4]">
        {activeTab === "tenant" && (
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 border-b border-[#F4F4F4] pb-8">
            <FormInput label="Owner Full Name" required value={formData.ownerName} onChange={(val) => handleInputChange("ownerName", val)} placeholder="Arlene McCoy" />
            <FormInput label="Owner Phone" required value={formData.ownerPhone} onChange={(val) => handleInputChange("ownerPhone", val)} placeholder="+91 9575225165" />
            <FormInput label="Owner Address" required value={formData.ownerAddress} onChange={(val) => handleInputChange("ownerAddress", val)} placeholder="C-101, Dhara Arcade , Mota Varacha Surat." />
          </div>
        )}

        <div className="flex flex-col gap-8 md:flex-row items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#F1F1F1] bg-gray-50 flex items-center justify-center group">
              {files.profileImage ? (
                <img src={URL.createObjectURL(files.profileImage)} className="h-full w-full object-cover" alt="Profile" />
              ) : previews.profileImage ? (
                <img src={previews.profileImage} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange("profileImage", file);
                }}
              />
            </div>
            <button className="text-sm font-bold text-[#5678E9]">Add Photo</button>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3 mb-6">
              <FormInput label="Full Name" required value={formData.name} onChange={(val) => handleInputChange("name", val)} placeholder="Enter Full Name" />
              <FormInput label="Phone Number" required value={formData.phoneNumber} onChange={(val) => handleInputChange("phoneNumber", val)} placeholder="+91" />
              <FormInput label="Email Address" value={formData.email} onChange={(val) => handleInputChange("email", val)} placeholder="Enter Email Address" />
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-5">
              <FormInput label="Age" required value={formData.age} onChange={(val) => handleInputChange("age", val)} placeholder="Enter Age" />
              <Select
                label="Gender"
                required
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" }
                ]}
                placeholder="Select Gender"
              />
              <Select
                label="Wing"
                required
                value={formData.wing}
                onChange={(e) => handleInputChange("wing", e.target.value)}
                options={[
                  { label: "A", value: "A" },
                  { label: "B", value: "B" },
                  { label: "C", value: "C" },
                  { label: "D", value: "D" },
                  { label: "E", value: "E" },
                  { label: "F", value: "F" },
                  { label: "G", value: "G" },
                  { label: "H", value: "H" },
                  { label: "I", value: "I" },
                  { label: "J", value: "J" }
                ]}
                placeholder="Select Wing"
              />
              <FormInput label="Unit" required value={formData.unit} onChange={(val) => handleInputChange("unit", val)} placeholder="1001" />
              <FormInput label="Relation" required value={formData.relation} onChange={(val) => handleInputChange("relation", val)} placeholder="Father" />
            </div>
          </div>
        </div>

        {/* Upload Documents */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { key: "uploadAadharfront", label: "Upload Aadhar Card (Front Side)" },
            { key: "uploadAadharback", label: "Upload Aadhar Card (Back Side)" },
            { key: "addressProof", label: "Address Proof (Vera Bill OR Light Bill)" },
            { key: "rentAgreeMent", label: "Rent Agreement" },
          ].map((doc) => (
            <div key={doc.key} className="flex flex-col gap-3">
              <UploadBox
                label={doc.label}
                onChange={(file) => handleFileChange(doc.key, file)}
              />
              {(files[doc.key] || previews[doc.key]) && (
                <div className="flex items-center gap-3 rounded-xl border border-[#F1F1F1] p-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#5678E9]">
                    <ImageIcon size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-bold text-[#202224]">
                      {files[doc.key] ? files[doc.key].name : "Existing Document"}
                    </p>
                    <p className="text-xs font-semibold text-[#A7A7A7]">
                      {files[doc.key] ? `${(files[doc.key].size / (1024 * 1024)).toFixed(1)} MB` : "Uploaded"}
                    </p>
                  </div>
                  {files[doc.key] ? (
                    <button onClick={() => {
                      const newFiles = { ...files };
                      delete newFiles[doc.key];
                      setFiles(newFiles);
                    }} className="text-[#A7A7A7] hover:text-[#E74C3C]">
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <a href={previews[doc.key]} target="_blank" rel="noopener noreferrer" className="text-[#5678E9] hover:underline text-xs font-bold">
                      View
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Member Counting Card */}
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#202224]">Member Counting :</h3>
            <span className="text-sm font-semibold text-[#A7A7A7]">(Other Members)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#202224]">Select Member</span>
              <Select
                value={memberCount.toString()}
                onChange={(e) => setMemberCount(parseInt(e.target.value))}
                options={memberOptions}
                className="w-16"
                showRadio={false}
              />
            </div>
            <button onClick={() => setIsMembersOpen(!isMembersOpen)}>
              {isMembersOpen ? <ChevronUp size={20} className="text-[#202224]" /> : <ChevronDown size={20} className="text-[#202224]" />}
            </button>
          </div>
        </div>

        {isMembersOpen && memberCount > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: memberCount }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-6 border-t border-[#F4F4F4] pt-4">
                <FormInput label="Full Name" value={members[i]?.name || ""} onChange={(val) => handleMemberChange(i, "name", val)} placeholder="Enter Full Name" className="h-auto" />
                <FormInput label="Phone No" value={members[i]?.phoneNumber || ""} onChange={(val) => handleMemberChange(i, "phoneNumber", val)} placeholder="+91" className="h-auto" />
                <FormInput label="Email" value={members[i]?.email || ""} onChange={(val) => handleMemberChange(i, "email", val)} placeholder="Enter Email Address" className="h-auto" />
                <FormInput label="Age" value={members[i]?.age || ""} onChange={(val) => handleMemberChange(i, "age", val)} placeholder="Enter Age" className="h-auto" />
                <Select
                  label="Gender"
                  value={members[i]?.gender || ""}
                  onChange={(e) => handleMemberChange(i, "gender", e.target.value)}
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" }
                  ]}
                  placeholder="Select Gender"
                />
                <FormInput label="Relation" value={members[i]?.relation || ""} onChange={(val) => handleMemberChange(i, "relation", val)} placeholder="Enter Relation" className="h-auto" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicle Counting Card */}
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#202224]">Vehicle Counting :</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#202224]">Select Vehicle</span>
              <Select
                value={vehicleCount.toString()}
                onChange={(e) => setVehicleCount(parseInt(e.target.value))}
                options={vehicleOptions}
                className="w-16"
                showRadio={false}
              />
            </div>
            <button onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}>
              {isVehiclesOpen ? <ChevronUp size={20} className="text-[#202224]" /> : <ChevronDown size={20} className="text-[#202224]" />}
            </button>
          </div>
        </div>

        {isVehiclesOpen && vehicleCount > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: vehicleCount }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-xl border border-[#F4F4F4] p-4">
                <Select
                  label="Vehicle Type"
                  required
                  value={vehicles[i]?.vehicleType || ""}
                  onChange={(e) => handleVehicleChange(i, "vehicleType", e.target.value)}
                  options={[
                    { label: "Two Wheeler", value: "Bike" },
                    { label: "Four Wheeler", value: "Car" }
                  ]}
                  placeholder="Select Vehicle Type"
                />
                <FormInput label="Vehicle Name" required value={vehicles[i]?.vehicleName || ""} onChange={(val) => handleVehicleChange(i, "vehicleName", val)} placeholder="Splendor" />
                <FormInput label="Vehicle Number" required value={vehicles[i]?.vehicleNumber || ""} onChange={(val) => handleVehicleChange(i, "vehicleNumber", val)} placeholder="GJ-5216" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="mt-5 flex justify-end gap-4 pb-8">
        <Button
          variant="outline"
          className="h-12 w-32 rounded-xl text-base font-bold text-[#202224] border-[#D3D3D3]"
          onClick={() => navigate("/resident-management")}
        >
          Cancel
        </Button>
        <Button
          className={cn(
            "h-12 w-32 rounded-xl text-base font-bold transition-all duration-200",
            !isFormValid() 
              ? "bg-[#F6F8FB] text-[#A7A7A7] cursor-not-allowed border-none shadow-none" 
              : "bg-primary-gradient text-white border-none"
          )}
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormValid()}
        >
          {id ? "Save" : "Create"}
        </Button>
      </div>
    </div>
  );
}
