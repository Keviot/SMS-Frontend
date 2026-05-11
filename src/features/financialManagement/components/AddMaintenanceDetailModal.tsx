import { useState } from "react";
import Button from "../../../ui/Button";
import FormDatePicker from "../../../ui/FormDatePicker";
import FormSelect from "../../../ui/FormSelect";

interface AddMaintenanceDetailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaintenanceDetailData) => void;
}

export interface MaintenanceDetailData {
  maintenanceAmount: string;
  penaltyAmount: string;
  maintenanceDueDate: string;
  penaltyAppliedAfterDay: string;
}

export default function AddMaintenanceDetailModal({
  open,
  onClose,
  onSubmit,
}: AddMaintenanceDetailModalProps) {
  const [formData, setFormData] = useState<MaintenanceDetailData>({
    maintenanceAmount: "",
    penaltyAmount: "",
    maintenanceDueDate: "",
    penaltyAppliedAfterDay: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate all fields
    if (!formData.maintenanceAmount || !formData.penaltyAmount ||
      !formData.maintenanceDueDate || !formData.penaltyAppliedAfterDay) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[410px] rounded-2xl bg-white p-5 shadow-xl">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-4">
          <h2 className="text-xl font-bold leading-6 text-[#202224]">
            Add Maintenance Detail
          </h2>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Maintenance Amount and Penalty Amount Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Maintenance Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Maintenance Amount<span className="text-[#FE512E]">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-[#202224]">
                  ₹
                </span>

                <input
                  type="number"
                  value={formData.maintenanceAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceAmount: e.target.value,
                    })
                  }
                  placeholder="0000"
                  className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-8 pr-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                />
              </div>
            </div>

            {/* Penalty Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Penalty Amount<span className="text-[#FE512E]">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-[#202224]">
                  ₹
                </span>

                <input
                  type="number"
                  value={formData.penaltyAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      penaltyAmount: e.target.value,
                    })
                  }
                  placeholder="0000"
                  className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-8 pr-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Due Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#202224]">
              Maintenance Due Date<span className="text-[#FE512E]">*</span>
            </label>

            <div className="relative">

              <FormDatePicker
                value={formData.maintenanceDueDate}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    maintenanceDueDate: value,
                  })
                }
              />

            </div>
          </div>

          {/* Penalty Applied After Day Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#202224]">
              Penalty Applied After Day Selection
              <span className="text-[#FE512E]">*</span>
            </label>

            <div className="relative">
              <FormSelect
                value={formData.penaltyAppliedAfterDay}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    penaltyAppliedAfterDay: value,
                  })
                }
                placeholder="Select Penalty Applied After Day Selection"
                options={Array.from({ length: 30 }, (_, i) => i + 1).map((day) => ({
                  value: String(day),
                  label: `${day} ${day === 1 ? "Day" : "Days"}`,
                }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-5 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-12 rounded-xl border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.maintenanceAmount || !formData.penaltyAmount ||
                !formData.maintenanceDueDate || !formData.penaltyAppliedAfterDay}
              className="h-12 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}