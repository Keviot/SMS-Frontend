import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import Select from "../../../ui/Select";
import { cn } from "../../../lib/cn";
import { residentApi, authApi } from "../../../services/api";
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

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div
              onClick={() => setSelectedStatus("occupied")}
              className={cn(
                "flex items-center h-16 gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                selectedStatus === "occupied" ? "gradient-border-primary-light" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                selectedStatus === "occupied" ? "gradient-border-primary" : "border-2 border-[#D9D9D9]"
              )}>
                {selectedStatus === "occupied" && <div className="w-3 h-3 rounded-full bg-primary-gradient" />}
              </div>
              <span className={cn("font-semibold text-sm whitespace-nowrap", selectedStatus === "occupied" ? "text-black" : "text-[#A7A7A7]")}>
                Occupied
              </span>
            </div>

            <div
              onClick={() => setSelectedStatus("vacate")}
              className={cn(
                "flex items-center h-16 gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                selectedStatus === "vacate" ? "gradient-border-primary-light" : "border-[#F1F1F1] bg-white"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                selectedStatus === "vacate" ? "gradient-border-primary" : "border-2 border-[#D9D9D9]"
              )}>
                {selectedStatus === "vacate" && <div className="w-3 h-3 rounded-full bg-primary-gradient" />}
              </div>
              <span className={cn("font-semibold text-sm whitespace-nowrap", selectedStatus === "vacate" ? "text-black" : "text-[#A7A7A7]")}>
                Vacate
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
              agreed ? "bg-primary-gradient border-none shadow-sm" : "border-[#D9D9D9] bg-white"
            )}>
              {agreed && <Check size={14} className="text-white" />}
            </div>
            <p className="text-sm font-medium text-[#4D4D4D] leading-relaxed">
              By submitting, you agree to select <span className="font-bold capitalize inline-block min-w-[70px] text-[#4D4D4D]">{selectedStatus}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={resetModal} className="h-12 rounded-xl text-base font-semibold text-[#202224]">
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} className="h-12 rounded-xl text-base font-semibold">
              Save
            </Button>
          </div>
        </div>
      ) : modalStep === 2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                label="Wing"
                required
                value={vacateData.wing}
                onChange={(e) => setVacateData({ ...vacateData, wing: e.target.value, unit: "" })}
                options={Array.from(new Set(residents.map(r => r.unitNumber.split(" ")[0])))
                  .filter(w => w !== "-")
                  .sort()
                  .map(w => ({ label: w, value: w }))}
                placeholder="Select Wing"
              />
            </div>
            <div className="flex-1">
              <Select
                label="Unit"
                required
                value={vacateData.unit}
                onChange={(e) => setVacateData({ ...vacateData, unit: e.target.value })}
                options={residents
                  .filter(r => r.unitNumber.startsWith(vacateData.wing + " "))
                  .map(r => r.unitNumber.split(" ")[1])
                  .filter(u => u !== "-")
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map(u => ({ label: u, value: u }))}
                placeholder="Select Unit"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button variant="outline" onClick={() => setModalStep(1)} className="h-12 rounded-xl text-base font-bold text-[#202224]">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!vacateData.wing || !vacateData.unit) {
                  toast.error("Please fill all required fields");
                  return;
                }
                setModalStep(3);
              }} 
              className={cn(
                "h-12 rounded-xl text-base font-bold transition-all duration-200",
                (!vacateData.wing || !vacateData.unit)
                  ? "bg-[#F6F8FB] text-[#A7A7A7] cursor-not-allowed border-none shadow-none"
                  : "bg-primary-gradient text-white border-none"
              )}
              disabled={!vacateData.wing || !vacateData.unit}
            >
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
