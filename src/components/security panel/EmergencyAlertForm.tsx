import { useState } from "react";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import toast from "react-hot-toast";
import { emergencyApi } from "../../services/api";

interface EmergencyAlertFormProps {
    societyId: string;
}

export default function EmergencyAlertForm({ societyId }: EmergencyAlertFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        alertType: "",
        description: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!societyId) {
            toast.error("Society ID not found. Please try again.");
            return;
        }

        if (!formData.alertType || !formData.description) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            await emergencyApi.create({
                ...formData,
                society: societyId
            });
            toast.success("Emergency alert sent successfully");
            setFormData({
                alertType: "",
                description: "",
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to send alert");
        } finally {
            setIsSubmitting(false);
        }
    };

    const alertOptions = [
        { label: "Emergency", value: "Emergency" },
        { label: "Warning", value: "Warning" },
        { label: "Fire Alarm", value: "Fire Alarm" },
        { label: "Earth Quake", value: "Earth Quake" },
        { label: "High Winds", value: "High Winds" },
        { label: "Thunder", value: "Thunder" },
    ];

    return (
        <div className="mx-auto mt-20 w-2xl rounded-2xl bg-white p-8 shadow-sm border border-[#F4F4F4]">
            <h2 className="mb-6 text-2xl font-bold text-[#202224]">Alert</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Select
                    label="Alert Type"
                    required
                    value={formData.alertType}
                    onChange={(e) => handleInputChange("alertType", e.target.value)}
                    options={alertOptions}
                    placeholder="Select Alert"
                    className="h-12 rounded-xl border-[#D3D3D3] text-sm"
                />

                <Textarea
                    label="Description"
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="An emergency description typically refers to a detailed account or explanation of an emergency situation."
                    className="min-h-[140px] rounded-xl border-[#D3D3D3] p-4 text-sm resize-none"
                />

                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09633] text-sm font-bold text-white shadow-[0_4px_15px_rgba(255,107,53,0.2)] hover:opacity-90 transition-all border-none"

                >
                    Send
                </Button>
            </form>
        </div>
    );
}
