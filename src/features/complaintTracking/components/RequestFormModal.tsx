import { useEffect, useState } from "react";
import FormDatePicker from "../../../ui/FormDatePicker";
import AppModal from "../../../components/modals/AppModal";

export interface RequestFormData {
  requesterName: string;
  requestName: string;
  description: string;
  requestDate: string;
  wing: string;
  unit: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "Solved";
}

interface RequestFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
  initialData?: RequestFormData | null;
  isEdit?: boolean;
}

const emptyForm: RequestFormData = {
  requesterName: "",
  requestName: "",
  description: "",
  requestDate: "",
  wing: "",
  unit: "",
  priority: "Medium",
  status: "Pending",
};

const inputBaseClass =
  "w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-medium leading-5 text-[#202224] outline-none transition placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0";

const labelClass = "text-sm font-semibold leading-5 text-[#202224]";
const requiredClass = "text-[#FE512E]";

export default function RequestFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}: RequestFormModalProps) {
  const [formData, setFormData] = useState<RequestFormData>(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setFormData({ ...emptyForm, ...initialData });
    } else {
      setFormData(emptyForm);
    }
  }, [open, isEdit, initialData]);

  const handleInputChange = (field: keyof RequestFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = Boolean(
    formData.requesterName.trim() &&
    formData.requestName.trim() &&
    formData.description.trim() &&
    formData.requestDate.trim() &&
    formData.wing.trim() &&
    formData.unit.trim() &&
    formData.priority &&
    formData.status
  );

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSubmit(formData);
  };

  if (!open) return null;


  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Request" : "Create Request"}
      widthClassName="w-full max-w-md"
      panelClassName="max-h-[calc(100vh-3rem)] overflow-y-auto"
      showHeaderDivider
    >
      <div className="mt-5 flex flex-col gap-4">
        {/* Requester Name */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Requester Name<span className={requiredClass}>*</span>
          </label>

          <input
            type="text"
            value={formData.requesterName}
            onChange={(e) =>
              handleInputChange("requesterName", e.target.value)
            }
            placeholder="Enter Name"
            className={inputBaseClass}
          />
        </div>

        {/* Request Name */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Request Name<span className={requiredClass}>*</span>
          </label>

          <input
            type="text"
            value={formData.requestName}
            onChange={(e) =>
              handleInputChange("requestName", e.target.value)
            }
            placeholder="Enter Name"
            className={inputBaseClass}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Description<span className={requiredClass}>*</span>
          </label>

          <textarea
            value={formData.description}
            onChange={(e) =>
              handleInputChange("description", e.target.value)
            }
            placeholder="Enter Description"
            rows={3}
            className={`${inputBaseClass} min-h-24 resize-none`}
          />
        </div>

        {/* Request Date */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Request Date<span className={requiredClass}>*</span>
          </label>

          <FormDatePicker
            value={formData.requestDate}
            onChange={(value) => handleInputChange("requestDate", value)}
            placeholder="Select Date"
            popupAlign="left"
          />
        </div>

        {/* Wing + Unit */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Wing<span className={requiredClass}>*</span>
            </label>

            <input
              type="text"
              value={formData.wing}
              onChange={(e) => handleInputChange("wing", e.target.value)}
              placeholder="Enter Wing"
              className={inputBaseClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Unit<span className={requiredClass}>*</span>
            </label>

            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              placeholder="Enter Unit"
              className={inputBaseClass}
            />
          </div>
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Priority<span className={requiredClass}>*</span>
          </label>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(["High", "Medium", "Low"] as const).map((priority) => {
              const selected = formData.priority === priority;

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handleInputChange("priority", priority)}
                  className={`flex min-h-12 items-center justify-center gap-1 sm:gap-2 rounded-[10px] border px-1 sm:px-3 py-2 text-xs sm:text-sm font-medium transition ${selected
                      ? "border-[#FE512E] bg-[#FFF7F3] text-[#202224]"
                      : "border-[#D9D9D9] bg-white text-[#A7A7A7] hover:border-[#FE512E]"
                    }`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#FE512E]" : "border-[#D9D9D9]"
                      }`}
                  >
                    {selected && (
                      <span className="size-2 rounded-full bg-[#FE512E]" />
                    )}
                  </span>
                  {priority}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Status<span className={requiredClass}>*</span>
          </label>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(["Open", "Pending", "Solved"] as const).map((status) => {
              const selected = formData.status === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleInputChange("status", status)}
                  className={`flex min-h-12 items-center justify-center gap-1 sm:gap-2 rounded-[10px] border px-1 sm:px-3 py-2 text-xs sm:text-sm font-medium transition ${selected
                      ? "border-[#FE512E] bg-[#FFF7F3] text-[#202224]"
                      : "border-[#D9D9D9] bg-white text-[#A7A7A7] hover:border-[#FE512E]"
                    }`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#FE512E]" : "border-[#D9D9D9]"
                      }`}
                  >
                    {selected && (
                      <span className="size-2 rounded-full bg-[#FE512E]" />
                    )}
                  </span>
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-[10px] border border-[#D9D9D9] bg-white px-5 py-3 text-base font-semibold text-[#202224] transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`min-h-12 rounded-[10px] px-5 py-3 text-base font-semibold transition disabled:cursor-not-allowed ${isFormValid
                ? "bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)] hover:opacity-95"
                : "bg-[#F6F8FB] text-[#202224]"
              }`}
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </AppModal>
  );
}