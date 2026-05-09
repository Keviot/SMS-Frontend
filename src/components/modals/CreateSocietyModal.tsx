import { useState } from "react";
import AppModal from "./AppModal";
import FormInput from "../../ui/FormInput";
import Button from "../../ui/Button";

type CreateSocietyModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
};

export default function CreateSocietyModal({
  open,
  onClose,
  onSave,
}: CreateSocietyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <AppModal
      open={open}
      title="Create New Society"
      onClose={onClose}
      widthClassName="max-w-[550px]"
      centerTitle={true}
    >
      <div className="flex flex-col gap-1">
        <FormInput
          label="Society Name"
          required
          placeholder="Enter Society Name"
          value={formData.name}
          onChange={(val) => handleChange("name", val)}
        />

        <FormInput
          label="Society Address"
          required
          placeholder="Enter Address"
          value={formData.address}
          onChange={(val) => handleChange("address", val)}
        />

        <div className="grid grid-cols-2 gap-x-4">
          <FormInput
            label="Country"
            required
            placeholder="Country"
            value={formData.country}
            onChange={(val) => handleChange("country", val)}
          />
          <FormInput
            label="State"
            required
            placeholder="State"
            value={formData.state}
            onChange={(val) => handleChange("state", val)}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <FormInput
            label="City"
            required
            placeholder="City"
            value={formData.city}
            onChange={(val) => handleChange("city", val)}
          />
          <FormInput
            label="Zip Code"
            required
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={(val) => handleChange("zipCode", val)}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            variant="danger-outline"
            className="h-12 w-full rounded-[10px] text-[16px] font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-12 w-full rounded-[10px] text-[16px] font-bold"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
