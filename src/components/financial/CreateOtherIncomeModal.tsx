import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import FormDatePicker from "../../ui/FormDatePicker";

interface CreateOtherIncomeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OtherIncomeData) => void;
  initialData?: OtherIncomeData | null;
  isEdit?: boolean;
}

export interface OtherIncomeData {
  title: string;
  date: string;
  dueDate: string;
  description: string;
  amount: string;
}

export default function CreateOtherIncomeModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}: CreateOtherIncomeModalProps) {
  const [formData, setFormData] = useState<OtherIncomeData>(
    initialData || {
      title: "",
      date: "",
      dueDate: "",
      description: "",
      amount: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }

    if (!initialData && !isEdit) {
      setFormData({
        title: "",
        date: "",
        dueDate: "",
        description: "",
        amount: "",
      });
    }
  }, [initialData, isEdit, open]);

  const handleSubmit = () => {
    onSubmit(formData);

    if (!isEdit) {
      setFormData({
        title: "",
        date: "",
        dueDate: "",
        description: "",
        amount: "",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] sm:max-w-[410px]">
        <div className="border-b border-[#E5E7EB] pb-4">
          <h2 className="text-xl font-bold leading-6 text-[#202224]">
            {isEdit ? `Edit ${formData.title || "Other Income"}` : "Create Other Income"}
          </h2>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#202224]">
              Title<span className="text-[#FE512E]">*</span>
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter Title"
              className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white px-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Date<span className="text-[#FE512E]">*</span>
              </label>

              <FormDatePicker
                value={formData.date}
                onChange={(value) =>
                  setFormData({ ...formData, date: value })
                }
                placeholder="Select Date"
                popupAlign="left"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-5 text-[#202224]">
                Due Date<span className="text-[#FE512E]">*</span>
              </label>

              <FormDatePicker
                value={formData.dueDate}
                onChange={(value) =>
                  setFormData({ ...formData, dueDate: value })
                }
                placeholder="Select Date"
                popupAlign="right"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#202224]">
              Description<span className="text-[#FE512E]">*</span>
            </label>

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter Description"
              className="min-h-24 w-full resize-none rounded-xl border border-[#D9D9D9] bg-white px-3 py-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-5 text-[#202224]">
              Amount<span className="text-[#FE512E]">*</span>
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-[#202224]">
                ₹
              </span>

              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0000"
                className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-8 pr-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 rounded-xl border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              className="h-12 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] text-base font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)]"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}