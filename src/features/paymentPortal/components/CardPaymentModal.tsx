import { useState } from "react";
import { X, Calendar } from "lucide-react";
import Button from "../../../ui/Button";

interface CardPaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CardPaymentData) => void;
}

interface CardPaymentData {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export default function CardPaymentModal({
    open,
    onClose,
    onSubmit,
}: CardPaymentModalProps) {
    const [formData, setFormData] = useState<CardPaymentData>({
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleCardNumberChange = (value: string) => {
        // Remove non-digits and format with spaces every 4 digits
        const cleaned = value.replace(/\D/g, "");
        const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
        setFormData({ ...formData, cardNumber: formatted });
    };

    const handleExpiryChange = (value: string) => {
        // Format as MM/YY
        const cleaned = value.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length >= 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
        }
        setFormData({ ...formData, expiryDate: formatted });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Header */}
                <h2 className="mb-6 text-xl font-semibold text-[#202224]">Payment Method</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Card Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#202224]">
                            Card Name<span className="text-[#E74C3C]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.cardName}
                            onChange={(e) =>
                                setFormData({ ...formData, cardName: e.target.value })
                            }
                            placeholder="Marcus George"
                            className="w-full rounded-xl border border-[#D9DCE5] bg-white px-4 py-3 text-sm text-[#202224] placeholder:text-[#A0A0A0] focus:border-[#FE512E] focus:outline-none"
                            required
                        />
                    </div>

                    {/* Card Number */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#202224]">
                            Card Number<span className="text-[#E74C3C]">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.cardNumber}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                placeholder="1234 4567 8745 1212"
                                maxLength={19}
                                className="w-full rounded-xl border border-[#D9DCE5] bg-white px-4 py-3 pr-12 text-sm text-[#202224] placeholder:text-[#A0A0A0] focus:border-[#FE512E] focus:outline-none"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#FE512E]">
                                    <span className="text-xs font-bold text-white">💳</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expiry Date and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#202224]">
                                Expiry Date<span className="text-[#E74C3C]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.expiryDate}
                                    onChange={(e) => handleExpiryChange(e.target.value)}
                                    placeholder="11/26"
                                    maxLength={5}
                                    className="w-full rounded-xl border border-[#D9DCE5] bg-white px-4 py-3 pr-10 text-sm text-[#202224] placeholder:text-[#A0A0A0] focus:border-[#FE512E] focus:outline-none"
                                    required
                                />
                                <Calendar
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#202224]">
                                CVV<span className="text-[#E74C3C]">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.cvv}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                                    })
                                }
                                placeholder="123"
                                maxLength={3}
                                className="w-full rounded-xl border border-[#D9DCE5] bg-white px-4 py-3 text-sm text-[#202224] placeholder:text-[#A0A0A0] focus:border-[#FE512E] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-[#D9DCE5] bg-white py-3 text-sm font-semibold text-[#202224] hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)]"
                        >
                            Pay Now
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
