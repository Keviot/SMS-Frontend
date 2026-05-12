import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "../../../ui/Button";

export interface ComplaintFormData {
    complainerName: string;
    complaintName: string;
    description: string;
    wing: string;
    unit: string;
    priority: "High" | "Medium" | "Low";
    status: "Open" | "Pending" | "Solve";
}

interface ComplaintFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ComplaintFormData) => void;
    initialData?: ComplaintFormData | null;
    isEdit?: boolean;
}

const emptyForm: ComplaintFormData = {
    complainerName: "",
    complaintName: "",
    description: "",
    wing: "",
    unit: "",
    priority: "Medium",
    status: "Pending",
};

export default function ComplaintFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    isEdit = false,
}: ComplaintFormModalProps) {
    const [formData, setFormData] = useState<ComplaintFormData>(emptyForm);

    useEffect(() => {
        if (!open) return;

        if (isEdit && initialData) {
            setFormData({ ...emptyForm, ...initialData });
        } else {
            setFormData(emptyForm);
        }
    }, [open, isEdit, initialData]);

    const handleInputChange = (
        field: keyof ComplaintFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const isFormValid =
        formData.complainerName.trim() &&
        formData.complaintName.trim() &&
        formData.description.trim() &&
        formData.wing.trim() &&
        formData.unit.trim();

    const handleSubmit = () => {
        if (isFormValid) {
            onSubmit(formData);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[92vh] w-full max-w-[410px] overflow-y-auto rounded-[15px] bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                {/* Header */}
                <div className="border-b border-[#E5E7EB] pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold leading-6 text-[#202224]">
                            {isEdit ? "Edit Complaint" : "Create Complaint"}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F6F8FB] text-[#6F7786] transition hover:bg-[#FFEDE6] hover:text-[#FE512E] sm:hidden"
                            aria-label="Close modal"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                    {/* Complainer Name */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Complainer Name<span className="text-[#FE512E]">*</span>
                        </label>

                        <input
                            type="text"
                            value={formData.complainerName}
                            onChange={(e) =>
                                handleInputChange("complainerName", e.target.value)
                            }
                            placeholder="Enter Name"
                            className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                        />
                    </div>

                    {/* Complaint Name */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Complaint Name<span className="text-[#FE512E]">*</span>
                        </label>

                        <input
                            type="text"
                            value={formData.complaintName}
                            onChange={(e) =>
                                handleInputChange("complaintName", e.target.value)
                            }
                            placeholder="Enter Name"
                            className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Description<span className="text-[#FE512E]">*</span>
                        </label>

                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Enter Description"
                            className="min-h-24 w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-medium leading-5 text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                        />
                    </div>

                    {/* Wing + Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-[5px]">
                            <label className="text-sm font-semibold leading-5 text-[#202224]">
                                Wing<span className="text-[#FE512E]">*</span>
                            </label>

                            <input
                                type="text"
                                value={formData.wing}
                                onChange={(e) => handleInputChange("wing", e.target.value)}
                                placeholder="Enter Wing"
                                className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                            />
                        </div>

                        <div className="flex flex-col gap-[5px]">
                            <label className="text-sm font-semibold leading-5 text-[#202224]">
                                Unit<span className="text-[#FE512E]">*</span>
                            </label>

                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => handleInputChange("unit", e.target.value)}
                                placeholder="Enter Unit"
                                className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                            />
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Priority<span className="text-[#FE512E]">*</span>
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {(["High", "Medium", "Low"] as const).map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => handleInputChange("priority", priority)}
                                    className={`flex h-12 items-center justify-center gap-2 rounded-[10px] border text-sm font-medium transition ${formData.priority === priority
                                            ? "border-[#FE512E] bg-[#FFF7F3] text-[#202224]"
                                            : "border-[#D9D9D9] bg-white text-[#A7A7A7] hover:border-[#FE512E]"
                                        }`}
                                >
                                    <span
                                        className={`flex size-4 items-center justify-center rounded-full border-2 ${formData.priority === priority
                                                ? "border-[#FE512E]"
                                                : "border-[#D9D9D9]"
                                            }`}
                                    >
                                        {formData.priority === priority && (
                                            <span className="size-2 rounded-full bg-[#FE512E]" />
                                        )}
                                    </span>
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Status<span className="text-[#FE512E]">*</span>
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {(["Open", "Pending", "Solve"] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleInputChange("status", status)}
                                    className={`flex h-12 items-center justify-center gap-2 rounded-[10px] border text-sm font-medium transition ${formData.status === status
                                            ? "border-[#FE512E] bg-[#FFF7F3] text-[#202224]"
                                            : "border-[#D9D9D9] bg-white text-[#A7A7A7] hover:border-[#FE512E]"
                                        }`}
                                >
                                    <span
                                        className={`flex size-4 items-center justify-center rounded-full border-2 ${formData.status === status
                                                ? "border-[#FE512E]"
                                                : "border-[#D9D9D9]"
                                            }`}
                                    >
                                        {formData.status === status && (
                                            <span className="size-2 rounded-full bg-[#FE512E]" />
                                        )}
                                    </span>
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-[51px] rounded-[10px] border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className={`h-[51px] rounded-[10px] text-base font-semibold shadow-none ${isFormValid
                                    ? "bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white"
                                    : "!bg-[#F6F8FB] text-[#202224]"
                                }`}
                        >
                            {isEdit ? "Save" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
