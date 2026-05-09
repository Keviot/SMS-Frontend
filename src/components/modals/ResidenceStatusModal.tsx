import { useState } from "react";
import { Check} from "lucide-react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { cn } from "../../lib/cn";
import { residentApi, authApi } from "../../services/api";
import toast from "react-hot-toast";

interface ResidenceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  residents: any[];
}

export default function ResidenceStatusModal({ isOpen, onClose, onSuccess, residents }: ResidenceStatusModalProps) {
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [selectedStatus, setSelectedStatus] = useState<"occupied" | "vacate">("occupied");
  const [agreed, setAgreed] = useState(false);
  const [vacateData, setVacateData] = useState({ wing: "", unit: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetModal = () => {
    setModalStep(1);
    setSelectedStatus("occupied");
    setAgreed(false);
    setVacateData({ wing: "", unit: "" });
    onClose();
  };

  const handleSaveStatus = () => {
    if (!agreed) {
      toast.error("Please agree to the terms");
      return;
    }

    if (selectedStatus === "occupied") {
      window.location.href = "/resident-management/add";
    } else {
      setModalStep(2);
    }
  };

  const handleCreateVacant = async () => {
    try {
      if (!vacateData.wing || !vacateData.unit) {
        toast.error("Please select wing and unit");
        return;
      }

      setIsSubmitting(true);

      // 1. Get profile for society ID
      const profile = await authApi.getProfile();
      const user = profile.user;
      const societyId = user?.society || (user?.societies && user.societies[0]?._id);

      if (!societyId) {
        toast.error("Society ID not found");
        return;
      }

      // 2. Find resident ID from the list
      // The unitNumber in the list is "Wing Unit", e.g., "A 1001"
      const targetUnitNumber = `${vacateData.wing} ${vacateData.unit}`;
      const existingResident = residents.find(r => r.unitNumber === targetUnitNumber);

      if (!existingResident) {
        toast.error("Resident not found in this unit. Cannot vacate a non-existent record.");
        return;
      }

      // 3. Call updateStatus API
      await residentApi.updateStatus(existingResident.id, {
        wing: vacateData.wing,
        unit: vacateData.unit,
        society: societyId,
        unitStatus: "Vacant"
      });

      toast.success("Unit marked as vacant");
      onSuccess();
      resetModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to vacate unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} title="Residence Status" onClose={resetModal}>
      {modalStep === 1 ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedStatus("occupied")}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                selectedStatus === "occupied" ? "border-[#FF6B35] bg-[#FFF8F5]" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedStatus === "occupied" ? "border-[#FF6B35]" : "border-[#D9D9D9]"
              )}>
                {selectedStatus === "occupied" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />}
              </div>
              <span className={cn("font-bold text-base", selectedStatus === "occupied" ? "text-[#FF6B35]" : "text-[#A7A7A7]")}>
                Occupied
              </span>
            </div>

            <div
              onClick={() => setSelectedStatus("vacate")}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                selectedStatus === "vacate" ? "border-[#FF6B35] bg-[#FFF8F5]" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedStatus === "vacate" ? "border-[#FF6B35]" : "border-[#D9D9D9]"
              )}>
                {selectedStatus === "vacate" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />}
              </div>
              <span className={cn("font-bold text-base", selectedStatus === "vacate" ? "text-[#FF6B35]" : "text-[#A7A7A7]")}>
                Vacate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              agreed ? "bg-[#FF6B35] border-[#FF6B35]" : "border-[#D9D9D9]"
            )}>
              {agreed && <Check size={14} className="text-white" />}
            </div>
            <p className="text-sm text-[#4D4D4D]">
              By submitting, you agree to select <span className="capitalize">{selectedStatus}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" onClick={resetModal} className="h-12 rounded-xl text-base font-bold text-[#202224]">
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} className="h-12 rounded-xl text-base font-bold">
              Save
            </Button>
          </div>
        </div>
      ) : modalStep === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-[#202224]">
                Wing<span className="text-[#E74C3C]">*</span>
              </label>
              <select 
                value={vacateData.wing}
                onChange={(e) => setVacateData({...vacateData, wing: e.target.value})}
                className="h-12 w-full rounded-xl border border-[#D3D3D3] px-3 text-sm outline-none focus:border-[#FF6B35]"
              >
                <option value="">Select Wing</option>
                {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-[#202224]">
                Unit<span className="text-[#E74C3C]">*</span>
              </label>
              <select 
                value={vacateData.unit}
                onChange={(e) => setVacateData({...vacateData, unit: e.target.value})}
                className="h-12 w-full rounded-xl border border-[#D3D3D3] px-3 text-sm outline-none focus:border-[#FF6B35]"
              >
                <option value="">Select Unit</option>
                {[1001, 1002, 1003, 1004, 2001, 2002, 3001, 3002].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" onClick={() => setModalStep(1)} className="h-12 rounded-xl text-base font-bold text-[#202224]">
              Cancel
            </Button>
            <Button onClick={() => {
              if (!vacateData.wing || !vacateData.unit) {
                toast.error("Please fill all required fields");
                return;
              }
              setModalStep(3);
            }} className="h-12 rounded-xl text-base font-bold">
              Create
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#202224]">Do you want to vacate the unit?</h3>
            <p className="mt-2 text-sm text-[#4D4D4D]">Are you sure you want to delete all details?</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" onClick={() => setModalStep(2)} className="h-12 rounded-xl text-base font-bold text-[#202224]">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCreateVacant} loading={isSubmitting} className="h-12 rounded-xl text-base font-bold">
              Confirm
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
