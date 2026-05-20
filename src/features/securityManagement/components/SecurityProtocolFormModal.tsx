import { useEffect, useMemo, useState } from "react";
import FormDatePicker from "../../../ui/FormDatePicker";
import FormTimePicker from "../../../ui/FormTimePicker";
import Button from "../../../ui/Button";

type SecurityProtocolFormData = {
    title: string;
    description: string;
    date?: string;
    time?: string;
};

type SecurityProtocolFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SecurityProtocolFormData) => void;
    isEdit?: boolean;
    initialData?: SecurityProtocolFormData | null;
};

const emptyForm: SecurityProtocolFormData = {
    title: "",
    description: "",
    date: "",
    time: "",
};

export default function SecurityProtocolFormModal({
    open,
    onClose,
    onSubmit,
    isEdit = false,
    initialData = null,
}: SecurityProtocolFormModalProps) {
    const [formData, setFormData] = useState<SecurityProtocolFormData>(emptyForm);

    useEffect(() => {
        if (!open) return;

        if (initialData) {
            setFormData({
                title: initialData.title ?? "",
                description: initialData.description ?? "",
                date: initialData.date ?? "",
                time: initialData.time ?? "",
            });
        } else {
            setFormData(emptyForm);
        }
    }, [open, initialData]);

    const isFormValid = useMemo(() => {
        if (isEdit) {
            return (
                formData.title.trim() &&
                formData.description.trim() &&
                formData.date?.trim() &&
                formData.time?.trim()
            );
        }

        return formData.title.trim() && formData.description.trim();
    }, [formData, isEdit]);

    if (!open) return null;

    const handleChange = (
        field: keyof SecurityProtocolFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        if (!isFormValid) return;
        onSubmit(formData);
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-[#E5E7EB] pb-4">
                    <h2 className="text-base font-bold leading-5 text-[#202224]">
                        {isEdit ? "Edit Security Protocols" : "Security Protocol"}
                    </h2>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Title<span className="text-[#E74C3C]">*</span>
                        </label>

                        <input
                            type="text"
                            value={formData.title}
                            onChange={(event) => handleChange("title", event.target.value)}
                            placeholder="Enter Title"
                            className="min-h-11 w-full rounded-[10px] border border-[#D3D3D3] bg-white px-3 text-sm font-medium text-[#202224] outline-none transition placeholder:text-[#A7A7A7] focus:border-[#202224]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Description<span className="text-[#E74C3C]">*</span>
                        </label>

                        <textarea
                            value={formData.description}
                            onChange={(event) =>
                                handleChange("description", event.target.value)
                            }
                            placeholder="Enter Description"
                            rows={isEdit ? 3 : 2}
                            className="max-h-32 min-h-16 w-full resize-none rounded-[10px] border border-[#D3D3D3] bg-white px-3 py-2 text-sm font-medium text-[#202224] outline-none transition placeholder:text-[#A7A7A7] focus:border-[#202224]"
                        />
                    </div>

                    {isEdit && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold leading-5 text-[#202224]">
                                    Date<span className="text-[#E74C3C]">*</span>
                                </label>

                                <FormDatePicker
                                    value={formData.date || ""}
                                    onChange={(value) => handleChange("date", value)}
                                    placeholder="Select Date"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold leading-5 text-[#202224]">
                                    Time<span className="text-[#E74C3C]">*</span>
                                </label>

                                <FormTimePicker
                                    value={formData.time || ""}
                                    onChange={(value) => handleChange("time", value)}
                                    placeholder="Select Time"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="min-h-12 rounded-[10px] border border-[#D3D3D3] bg-white text-sm font-semibold text-[#202224] hover:bg-gray-50"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className={`min-h-12 rounded-[10px] text-sm font-bold transition ${isFormValid
                                ? "bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)] hover:shadow-[0_12px_24px_rgba(255,107,53,0.28)]"
                                : "cursor-not-allowed bg-[#F6F8FB] text-[#202224]"
                            }`}
                    >
                        {isEdit ? "Save" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}