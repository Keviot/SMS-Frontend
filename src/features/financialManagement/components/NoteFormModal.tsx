import { useEffect, useState } from "react";
import Button from "../../../ui/Button";
import FormDatePicker from "../../../ui/FormDatePicker";

export interface NoteFormData {
    title: string;
    description: string;
    date: string;
}

interface NoteFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: NoteFormData) => void;
    initialData?: NoteFormData | null;
    isEdit?: boolean;
}

const emptyForm: NoteFormData = {
    title: "",
    description: "",
    date: "",
};

export default function NoteFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    isEdit = false,
}: NoteFormModalProps) {
    const [formData, setFormData] = useState<NoteFormData>(emptyForm);

    useEffect(() => {
        if (!open) return;

        if (isEdit && initialData) {
            setFormData({
                ...emptyForm,
                ...initialData,
            });
        } else {
            setFormData(emptyForm);
        }
    }, [open, isEdit, initialData]);

    const handleChange = (field: keyof NoteFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const isFormValid =
        formData.title.trim().length > 0 &&
        formData.description.trim().length > 0 &&
        formData.date.trim().length > 0;

    const handleSubmit = () => {
        if (!isFormValid) return;
        onSubmit(formData);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-[410px] rounded-[15px] bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                {/* Header */}
                <div className="border-b border-[#E5E7EB] pb-4">
                    <h2 className="text-xl font-bold leading-6 text-[#202224]">
                        {isEdit ? "Edit Note" : "Add Note"}
                    </h2>
                </div>

                <div className="mt-5 flex flex-col gap-4">
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
                            className="min-h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white px-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
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
                            className="min-h-24 w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-medium leading-5 text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                        />
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-sm font-semibold leading-5 text-[#202224]">
                            Date<span className="text-[#FE512E]">*</span>
                        </label>

                        <FormDatePicker
                            value={formData.date}
                            onChange={(value) => handleChange("date", value)}
                            placeholder="Select Date"
                            popupAlign="left"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="min-h-[3.2rem] rounded-[10px] border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50"
                        >
                            Cancel
                        </Button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className={`inline-flex min-h-[3.2rem] items-center justify-center rounded-[10px] text-base font-semibold transition-all disabled:cursor-not-allowed ${isFormValid
                                    ? "bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white hover:opacity-95"
                                    : "bg-[#F6F8FB] text-[#202224]"
                                }`}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}