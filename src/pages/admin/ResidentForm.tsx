import { useState } from "react";
import { Camera, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import FormInput from "../../ui/FormInput";
import Select from "../../ui/Select";
import UploadBox from "../../ui/UploadBox";
import { cn } from "../../lib/cn";
import { residentApi } from "../../services/api";
import toast from "react-hot-toast";

export default function ResidentForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"owner" | "tenant">("owner");
  const [memberCount, setMemberCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    age: "",
    gender: "",
    wing: "",
    unit: "",
    relation: "",
  });

  const [members, setMembers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const data = new FormData();
      
      // Append main fields
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append("residentStatus", activeTab);

      // Append files
      Object.entries(files).forEach(([key, file]) => data.append(key, file));

      // Append members and vehicles as JSON strings (backend should parse them)
      data.append("members", JSON.stringify(members.slice(0, memberCount)));
      data.append("vehicles", JSON.stringify(vehicles.slice(0, vehicleCount)));

      await residentApi.create(data);
      toast.success("Resident created successfully");
      navigate("/resident-management");
    } catch (error: any) {
      toast.error(error.message || "Failed to create resident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberOptions = Array.from({ length: 11 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
  const vehicleOptions = Array.from({ length: 11 }, (_, i) => ({ label: `${i}`, value: `${i}` }));

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex gap-0 overflow-hidden rounded-t-xl">
        <button
          onClick={() => setActiveTab("owner")}
          className={cn(
            "h-12 rounded-tl-xl rounded-tr-xl px-10 text-sm font-semibold transition-all",
            activeTab === "owner"
              ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
              : "bg-white text-[#202224] hover:bg-gray-50"
          )}
        >
          Owner
        </button>
        <button
          onClick={() => setActiveTab("tenant")}
          className={cn(
            "h-12 px-10 text-sm font-semibold transition-all rounded-tl-xl rounded-tr-xl",
            activeTab === "tenant"
              ? "bg-gradient-to-r from-[#FE512E] to-[#F09633] text-white shadow-lg"
              : "bg-white text-[#202224] hover:bg-gray-50"
          )}
        >
          Tenant
        </button>
      </div>

      {/* Main Details Card */}
      <div className="rounded-b-2xl rounded-tr-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8 md:flex-row h-fit">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-[#D9D9D9] flex items-center justify-center">
              {files.profilePhoto ? (
                <img src={URL.createObjectURL(files.profilePhoto)} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <Camera size={32} className="text-white" />
              )}
              <input 
                type="file" 
                className="absolute inset-0 cursor-pointer opacity-0" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange("profilePhoto", file);
                }}
              />
            </div>
            <button className="text-sm font-bold text-[#5678E9]">Add Photo</button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-4">
            <FormInput label="Full Name" required value={formData.fullName} onChange={(val) => handleInputChange("fullName", val)} placeholder="Enter Full Name" className="h-auto" />
            <FormInput label="Phone Number" required value={formData.phoneNumber} onChange={(val) => handleInputChange("phoneNumber", val)} placeholder="+91" className="h-auto" />
            <FormInput label="Email Address" value={formData.emailAddress} onChange={(val) => handleInputChange("emailAddress", val)} placeholder="Enter Email Address" className="h-auto" />
            <FormInput label="Age" required value={formData.age} onChange={(val) => handleInputChange("age", val)} placeholder="Enter Age" className="h-auto" />
            
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

            <FormInput label="Wing" required value={formData.wing} onChange={(val) => handleInputChange("wing", val)} placeholder="Enter Wing" className="h-auto" />
            <FormInput label="Unit" required value={formData.unit} onChange={(val) => handleInputChange("unit", val)} placeholder="Enter Unit" className="h-auto" />
            <FormInput label="Relation" required value={formData.relation} onChange={(val) => handleInputChange("relation", val)} placeholder="Enter Relation" className="h-auto" />
          </div>
        </div>

        {/* Upload Documents */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <UploadBox 
            label="Upload Aadhar Card (Front Side)" 
            fileName={files.aadharFront?.name} 
            onChange={(file) => handleFileChange("aadharFront", file)} 
          />
          <UploadBox 
            label="Upload Aadhar Card (Back Side)" 
            fileName={files.aadharBack?.name} 
            onChange={(file) => handleFileChange("aadharBack", file)} 
          />
          <UploadBox 
            label="Address Proof (Vera Bill OR Light Bill)" 
            fileName={files.addressProof?.name} 
            onChange={(file) => handleFileChange("addressProof", file)} 
          />
          <UploadBox 
            label="Rent Agreement" 
            fileName={files.rentAgreement?.name} 
            onChange={(file) => handleFileChange("rentAgreement", file)} 
          />
        </div>
      </div>

      {/* Member Counting Card */}
      <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#202224]">Member Counting :</h3>
            <span className="text-sm font-semibold text-[#A7A7A7]">(Other Members)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#202224]">Select Member</span>
              <select 
                value={memberCount} 
                onChange={(e) => setMemberCount(parseInt(e.target.value))}
                className="h-10 w-16 rounded-lg border border-[#D3D3D3] px-2 text-sm font-bold outline-none"
              >
                {memberOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={() => setIsMembersOpen(!isMembersOpen)}>
              {isMembersOpen ? <ChevronUp size={20} className="text-[#202224]" /> : <ChevronDown size={20} className="text-[#202224]" />}
            </button>
          </div>
        </div>

        {isMembersOpen && memberCount > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            {Array.from({ length: memberCount }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-6 border-t border-[#F4F4F4] pt-4">
                <FormInput label="Full Name" value={members[i]?.fullName || ""} onChange={(val) => handleMemberChange(i, "fullName", val)} placeholder="Enter Full Name" className="h-auto" />
                <FormInput label="Phone No" value={members[i]?.phoneNumber || ""} onChange={(val) => handleMemberChange(i, "phoneNumber", val)} placeholder="+91" className="h-auto" />
                <FormInput label="Email" value={members[i]?.emailAddress || ""} onChange={(val) => handleMemberChange(i, "emailAddress", val)} placeholder="Enter Email Address" className="h-auto" />
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
      <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#202224]">Vehicle Counting :</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#202224]">Select Vehicle</span>
              <select 
                value={vehicleCount} 
                onChange={(e) => setVehicleCount(parseInt(e.target.value))}
                className="h-10 w-16 rounded-lg border border-[#D3D3D3] px-2 text-sm font-bold outline-none"
              >
                {vehicleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}>
              {isVehiclesOpen ? <ChevronUp size={20} className="text-[#202224]" /> : <ChevronDown size={20} className="text-[#202224]" />}
            </button>
          </div>
        </div>

        {isVehiclesOpen && vehicleCount > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: vehicleCount }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-[#F4F4F4] p-4">
                <Select 
                  label="Vehicle Type" 
                  value={vehicles[i]?.type || ""}
                  onChange={(e) => handleVehicleChange(i, "type", e.target.value)}
                  options={[
                    { label: "Two Wheeler", value: "two" },
                    { label: "Four Wheeler", value: "four" }
                  ]} 
                  placeholder="Select Vehicle Type"
                />
                <FormInput label="Vehicle Name" value={vehicles[i]?.name || ""} onChange={(val) => handleVehicleChange(i, "name", val)} placeholder="Enter Name" className="h-auto" />
                <FormInput label="Vehicle Number" value={vehicles[i]?.number || ""} onChange={(val) => handleVehicleChange(i, "number", val)} placeholder="Enter Number" className="h-auto" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="mt-10 flex justify-end gap-4 pb-8">
        <Button 
          variant="outline" 
          className="h-12 w-32 rounded-xl text-base font-bold text-[#202224] border-[#D3D3D3]"
          onClick={() => navigate("/resident-management")}
        >
          Cancel
        </Button>
        <Button 
          className="h-12 w-32 rounded-xl text-base font-bold"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
