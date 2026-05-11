import { useEffect, useRef, useState } from "react";
import { Calendar, FileText, UploadCloud, X } from "lucide-react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";

export interface ExpenseFormData {
  title: string;
  description: string;
  date: string;
  amount: string;
  bill?: File | null;
  billName?: string;
  billSize?: string;
  billFormat?: string;
}

interface AddEditExpenseModalProps {
  open: boolean;
  mode?: "add" | "edit";
  initialData?: ExpenseFormData | null;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
}

const emptyForm: ExpenseFormData = {
  title: "",
  description: "",
  date: "",
  amount: "",
  bill: null,
  billName: "",
  billSize: "",
  billFormat: "",
};

export default function AddEditExpenseModal({
  open,
  mode = "add",
  initialData,
  onClose,
  onSubmit,
}: AddEditExpenseModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [open, mode, initialData]);

  const handleChange = (
    field: keyof ExpenseFormData,
    value: string | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const sizeInMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const extension = file.name.split(".").pop()?.toUpperCase() || "";

    setFormData((prev) => ({
      ...prev,
      bill: file,
      billName: file.name,
      billSize: sizeInMb,
      billFormat: extension,
    }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      bill: null,
      billName: "",
      billSize: "",
      billFormat: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Edit Expenses" : "Add Expenses Details"}
      onClose={onClose}
      className="max-w-[410px] rounded-[15px] p-5"
    >
      <div className="-mt-2 border-t border-[#E5E7EB] pt-5">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-semibold leading-5 text-[#202224]">
              Title<span className="text-[#FE512E]">*</span>
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter Title"
              className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-semibold leading-5 text-[#202224]">
              Description<span className="text-[#FE512E]">*</span>
            </label>

            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter Description"
              rows={4}
              className="min-h-[96px] w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224]"
            />
          </div>

          {/* Date + Amount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-[5px]">
              <label className="text-sm font-semibold leading-5 text-[#202224]">
                Date<span className="text-[#FE512E]">*</span>
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 pr-10 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224]"
                />

                <Calendar
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#202224]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-sm font-semibold leading-5 text-[#202224]">
                Amount<span className="text-[#FE512E]">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#202224]">
                  ₹
                </span>

                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0000"
                  className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white pl-9 pr-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224]"
                />
              </div>
            </div>
          </div>

          {/* Upload Bill */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-semibold leading-5 text-[#202224]">
              Upload Bill<span className="text-[#FE512E]">*</span>
            </label>

            {!formData.billName ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[96px] w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#D9D9D9] bg-white px-4 py-4 text-center transition hover:border-[#FE512E] hover:bg-[#FFF7F3]"
              >
                <UploadCloud size={24} className="mb-2 text-[#6F7786]" />

                <span className="text-sm font-semibold text-[#202224]">
                  Upload a file or drag and drop
                </span>

                <span className="mt-1 text-xs font-medium text-[#A7A7A7]">
                  PNG, JPG, GIF up to 10MB
                </span>
              </button>
            ) : (
              <div className="flex min-h-[72px] items-center justify-between gap-3 rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#F5F6FA]">
                    <FileText size={20} className="text-[#5678E9]" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#202224]">
                      {formData.billName}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#6F7786]">
                      {formData.billSize || "3.5 MB"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F5F6FA] text-[#6F7786] transition hover:bg-[#FFEDE6] hover:text-[#FE512E]"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            {formData.billName ? (
              <p className="text-xs font-medium text-[#39973D]">
                File Uploaded Successfully
              </p>
            ) : null}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 rounded-[10px] border border-[#D9D9D9] bg-white text-base font-semibold text-[#4F4F4F] hover:bg-gray-50"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              className="h-12 rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-base font-semibold text-white shadow-none"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}