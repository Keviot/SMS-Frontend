import * as React from "react";
import { X, CreditCard, Smartphone } from "lucide-react";
import Button from "../../../ui/Button";

interface PaymentMethodModalProps {
    open: boolean;
    onClose: () => void;
    onSelectMethod: (method: string) => void;
}

export default function PaymentMethodModal({
    open,
    onClose,
    onSelectMethod,
}: PaymentMethodModalProps) {
    if (!open) return null;

    const paymentMethods = [
        {
            id: "mastercard",
            name: "Master Card",
            icon: "💳",
            type: "card",
        },
        {
            id: "visa",
            name: "Visa Card",
            icon: "💳",
            type: "card",
        },
        {
            id: "cash",
            name: "Cash Payment",
            icon: "💵",
            type: "cash",
        },
    ];

    const [selectedMethod, setSelectedMethod] = React.useState("mastercard");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Header */}
                <h2 className="mb-6 text-xl font-semibold text-[#202224]">Payment Method</h2>

                {/* Payment Methods */}
                <div className="mb-6 space-y-3">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#D9DCE5] bg-white p-4 transition-all hover:border-[#FE512E] hover:bg-[#FFF5F3]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-[#F6F8FB]">
                                    <span className="text-xl">{method.icon}</span>
                                </div>
                                <span className="text-sm font-semibold text-[#202224]">
                                    {method.name}
                                </span>
                            </div>
                            <div
                                className={`flex size-5 items-center justify-center rounded-full border-2 ${selectedMethod === method.id
                                    ? "border-[#FE512E] bg-[#FE512E]"
                                    : "border-[#D9DCE5] bg-white"
                                    }`}
                            >
                                {selectedMethod === method.id && (
                                    <div className="size-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-[#D9DCE5] bg-white py-3 text-sm font-semibold text-[#202224] hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            const method = paymentMethods.find((m) => m.id === selectedMethod);
                            onSelectMethod(method?.type || "card");
                        }}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)]"
                    >
                        Pay Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
