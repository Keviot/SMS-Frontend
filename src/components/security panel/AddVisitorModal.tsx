import { useEffect, useMemo, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import FormInput from "../../ui/FormInput";
import toast from "react-hot-toast";
import { securityApi } from "../../services/api";

interface UnitOption {
    wing: string;
    unit: string;
}

interface AddVisitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    societyId: string;
    unitOptions: UnitOption[];
}

export default function AddVisitorModal({
    isOpen,
    onClose,
    onSuccess,
    societyId,
    unitOptions,
}: AddVisitorModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        wing: "",
        unit: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }),
    });

    const wingOptions = useMemo(() => {
        return Array.from(
            new Set(
                unitOptions
                    .map((item) => item.wing)
                    .filter((wing) => wing && wing !== "-")
            )
        ).sort();
    }, [unitOptions]);

    const filteredUnitOptions = useMemo(() => {
        if (!formData.wing) return [];

        return unitOptions
            .filter((item) => item.wing === formData.wing)
            .map((item) => item.unit)
            .filter((unit) => unit && unit !== "-")
            .sort((a, b) => Number(a) - Number(b));
    }, [formData.wing, unitOptions]);

    useEffect(() => {
        if (!isOpen) return;

        setFormData((prev) => ({
            ...prev,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        }));
    }, [isOpen]);

    const handleValueChange = (name: string, value: string) => {
        setFormData((prev) => {
            if (name === "wing") {
                return {
                    ...prev,
                    wing: value,
                    unit: "",
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            phoneNumber: "",
            wing: "",
            unit: "",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!societyId) {
            toast.error("Society ID not found. Please try again.");
            return;
        }

        if (!formData.wing) {
            toast.error("Please select wing.");
            return;
        }

        if (!formData.unit) {
            toast.error("Please select unit.");
            return;
        }

        try {
            setIsSubmitting(true);

            await securityApi.addVisitor({
                ...formData,
                society: societyId,
            });

            toast.success("Visitor details added successfully");
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to add visitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose} title="Add Visitor Details.">
            <form onSubmit={handleSubmit} className="space-y-5 p-2">
                <FormInput
                    label="Visitor Name"
                    value={formData.name}
                    onChange={(val) => handleValueChange("name", val)}
                    required
                    placeholder="Enter Name"
                />

                <FormInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(val) => handleValueChange("phoneNumber", val)}
                    required
                    placeholder="Enter Phone Number"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#202224]">
                            Wing<span className="text-red-500">*</span>
                        </label>

                        <select
                            value={formData.wing}
                            onChange={(e) => handleValueChange("wing", e.target.value)}
                            required
                            className="h-10 w-full rounded-lg border border-[#D3D3D3] bg-white px-3 text-sm font-medium text-[#202224] outline-none transition-all focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                        >
                            <option value="">Select Wing</option>

                            {wingOptions.map((wing) => (
                                <option key={wing} value={wing}>
                                    {wing}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#202224]">
                            Unit<span className="text-red-500">*</span>
                        </label>

                        <select
                            value={formData.unit}
                            onChange={(e) => handleValueChange("unit", e.target.value)}
                            required
                            disabled={!formData.wing}
                            className="h-10 w-full rounded-lg border border-[#D3D3D3] bg-white px-3 text-sm font-medium text-[#202224] outline-none transition-all focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#A7A7A7]"
                        >
                            <option value="">
                                {formData.wing ? "Select Unit" : "Select Wing First"}
                            </option>

                            {filteredUnitOptions.map((unit) => (
                                <option key={`${formData.wing}-${unit}`} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(val) => handleValueChange("date", val)}
                        required
                    />

                    <FormInput
                        label="Time"
                        value={formData.time}
                        onChange={(val) => handleValueChange("time", val)}
                        required
                        placeholder="Select Time"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-12 flex-1 rounded-xl border-[#D3D3D3] font-bold text-[#202224]"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        className="h-12 flex-1 rounded-xl border-none bg-[#FF6B35] font-bold shadow-[0_4px_15px_rgba(255,107,53,0.2)] hover:bg-[#E85D2A]"
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}