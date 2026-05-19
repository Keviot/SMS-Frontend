import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, X, Loader2 } from "lucide-react";
import Button from "../../../ui/Button";
import FormDatePicker from "../../../ui/FormDatePicker";

export interface ExpenseFormData {
    title: string;
    description: string;
    date: string;
    amount: string;
    billFile?: File | null;
    billName?: string;
    billSize?: string;
}

interface ExpenseFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ExpenseFormData) => void | Promise<void>;
    initialData?: ExpenseFormData | null;
    isEdit?: boolean;
}

const emptyForm: ExpenseFormData = {
    title: "",
    description: "",
    date: "",
    amount: "",
    billFile: null,
    billName: "",
    billSize: "",
};

export default function ExpenseFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    isEdit = false,
}: ExpenseFormModalProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState<ExpenseFormData>(emptyForm);


    const [loader, setLoader] = useState(false);

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

    const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        const sizeInMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        setFormData((prev) => ({
            ...prev,
            billFile: file,
            billName: file.name,
            billSize: sizeInMb,
        }));
    };

    const handleRemoveFile = () => {
        setFormData((prev) => ({
            ...prev,
            billFile: null,
            billName: "",
            billSize: "",
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const isFormValid =
        formData.title.trim() &&
        formData.description.trim() &&
        formData.date.trim() &&
        formData.amount.trim() &&
        formData.billName;

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setLoader(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting expense:", error);
        } finally {
            setLoader(false);
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
                            {isEdit ? "Edit Expenses" : "Add Expenses Details"}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loader}
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F6F8FB] text-[#6F7786] transition hover:bg-[#FFEDE6] hover:text-[#FE512E] sm:hidden ${loader ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            aria-label="Close modal"
                        >
                            <X size={17} />
                        </button>
                    </div>
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
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="Enter Title"
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
                            onChange={(e) =>
                                handleInputChange("description", e.target.value)
                            }
                            placeholder="Enter Description"
                            className="min-h-24 w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-4 py-3 text-sm font-medium leading-5 text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
                        />
                    </div>

                    {/* Date + Amount */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-[5px]">
                            <label className="text-sm font-semibold leading-5 text-[#202224]">
                                Date<span className="text-[#FE512E]">*</span>
                            </label>

                            <FormDatePicker
                                value={formData.date}
                                onChange={(value) => handleInputChange("date", value)}
                                placeholder="Select Date"
                                popupAlign="left"
                            />
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
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                    placeholder="0000"
                                    className="h-12 w-full rounded-[10px] border border-[#D9D9D9] bg-white pl-9 pr-4 text-sm font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7] focus:border-[#202224] focus:ring-0"
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
                                className="flex min-h-[135px] w-full flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#D3D3D3] bg-white px-6 py-5 text-center transition hover:border-[#FE512E] hover:bg-[#FFF7F3]"
                            >
                                <ImagePlus size={32} className="mb-3 text-[#A7A7A7]" />

                                <span className="text-sm font-semibold leading-5 text-[#5678E9]">
                                    Upload a file
                                </span>

                                <span className="text-sm font-semibold leading-5 text-[#202224]">
                                    or drag and drop
                                </span>

                                <span className="mt-1 text-xs font-medium leading-4 text-[#A7A7A7]">
                                    PNG, JPG, GIF up to 10MB
                                </span>
                            </button>
                        ) : (
                            <div className="flex min-h-[86px] w-full items-center justify-between gap-3 rounded-[10px] border border-[#202224] bg-white p-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium leading-5 text-[#202224]">
                                        {formData.billName}
                                    </p>

                                    <p className="mt-1 text-xs font-medium leading-4 text-[#6F7786]">
                                        {formData.billSize || "3.5 MB"}
                                    </p>

                                    <p className="mt-1 text-xs font-medium leading-4 text-[#39973D]">
                                        File Uploaded Successfully
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F6FA] text-[#A7A7A7] transition hover:bg-[#FFF1F1] hover:text-[#E74C3C]"
                                    aria-label="Remove uploaded bill"
                                >
                                    <Trash2 size={17} />
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
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loader}
                            className={`h-[51px] rounded-[10px] border border-[#D9D9D9] bg-white text-base font-semibold text-[#202224] hover:bg-gray-50 ${loader ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isFormValid || loader}
                            className={`h-[51px] rounded-[10px] text-base font-semibold shadow-none flex items-center justify-center gap-2 ${isFormValid && !loader
                                    ? "bg-gradient-to-r from-[#FE512E] to-[#F09619] text-white cursor-pointer"
                                    : "!bg-[#F6F8FB] text-[#202224] cursor-not-allowed opacity-70"
                                }`}
                        >
                            {loader ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}