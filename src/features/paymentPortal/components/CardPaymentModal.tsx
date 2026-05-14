import { useState } from "react";
import Button from "../../../ui/Button";
import FormDatePicker from "../../../ui/FormDatePicker";
import { MastercardIcon } from "../../../assets/icons/admin-dashboard-icons";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-[410px] rounded-[15px] bg-white p-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <h2 className="text-[22px] font-semibold leading-[28px] text-[#202224]">
          Payment Method
        </h2>

        <div className="mt-[14px] h-px w-full bg-[#F1F1F1]" />

        <form onSubmit={handleSubmit} className="mt-[20px]">
          <div className="flex h-[96px] flex-col gap-[5px]">
            <label className="text-[14px] font-medium leading-[19px] text-[#202224]">
              Card Name<span className="text-[#FE512E]">*</span>
            </label>

            <input
              type="text"
              value={formData.cardName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardName: e.target.value }))
              }
              placeholder="Marcus George"
              className="h-[42px] w-full rounded-[10px] border border-[#202224] bg-white px-[13px] text-[14px] font-medium leading-[19px] text-[#202224] outline-none placeholder:text-[#202224]"
              required
            />
          </div>

          <div className="flex h-[96px] flex-col gap-[5px]">
            <label className="text-[14px] font-medium leading-[19px] text-[#202224]">
              Card Number<span className="text-[#FE512E]">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 4567 8745 5212"
                maxLength={19}
                className="h-[42px] w-full rounded-[10px] border border-[#202224] bg-white px-[13px] pr-[44px] text-[14px] font-medium leading-[19px] text-[#202224] outline-none placeholder:text-[#202224]"
                required
              />

              <span className="absolute right-[13px] top-1/2 flex h-[18px] w-[24px] -translate-y-1/2 items-center justify-center">
                <MastercardIcon className="h-[16px] w-[22px]" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[13px]">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[14px] font-medium leading-[19px] text-[#202224]">
                Expiry Date<span className="text-[#FE512E]">*</span>
              </label>

              <FormDatePicker
                value={formData.expiryDate}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, expiryDate: value }))
                }
                placeholder="11/12"
                className="[&>button]:h-[42px] [&>button]:rounded-[10px] [&>button]:border-[#202224] [&>button]:px-[13px] [&>button]:text-[14px] [&>button]:font-medium [&>button]:text-[#202224]"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[14px] font-medium leading-[19px] text-[#202224]">
                CVV<span className="text-[#FE512E]">*</span>
              </label>

              <input
                type="text"
                value={formData.cvv}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                  }))
                }
                placeholder="225"
                maxLength={3}
                className="h-[42px] w-full rounded-[10px] border border-[#202224] bg-white px-[13px] text-[14px] font-medium leading-[19px] text-[#202224] outline-none placeholder:text-[#202224]"
                required
              />
            </div>
          </div>

          <div className="mt-[20px] grid grid-cols-2 gap-[13px]">
            <Button
              type="button"
              onClick={onClose}
              className="h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white text-[18px] font-semibold leading-[24px] text-[#202224] shadow-none hover:bg-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-[51px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[18px] font-semibold leading-[24px] text-white shadow-none"
            >
              Pay Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}