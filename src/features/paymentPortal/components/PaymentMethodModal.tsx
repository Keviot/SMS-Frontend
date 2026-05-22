import * as React from "react";
import Button from "../../../ui/Button";
import {
  MastercardIcon,
  VisacardIcon,
  NotificationCashIcon,
} from "../../../assets/icons/admin-dashboard-icons";
import AppModal from "../../../components/modals/AppModal";

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
  const [selectedMethod, setSelectedMethod] = React.useState("mastercard");

  if (!open) return null;

  const paymentMethods = [
    {
      id: "mastercard",
      name: "Master Card",
      type: "card",
      Icon: MastercardIcon,
    },
    {
      id: "visa",
      name: "Visa Card",
      type: "card",
      Icon: VisacardIcon,
    },
    {
      id: "cash",
      name: "Cash Payment",
      type: "cash",
      Icon: NotificationCashIcon,
    },
  ];

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Payment Method"
      widthClassName="w-full max-w-[410px]"
      titleClassName="text-[24px] font-semibold leading-[30px] text-[#202224]"
      showHeaderDivider={true}
      panelClassName="p-[20px]"
    >

        <div className="mt-[20px] flex flex-col gap-[10px]">
          {paymentMethods.map(({ id, name, Icon }) => {
            const isSelected = selectedMethod === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedMethod(id)}
                className="flex h-[56px] w-full items-center justify-between rounded-[10px] bg-white px-[15px] py-[10px] shadow-[0_0_18px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-[10px]">
                  <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[6px] bg-[#F6F8FB]">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>

                  <span
                    className={`text-[18px] font-semibold leading-[24px] ${
                      isSelected ? "text-[#202224]" : "text-[#A7A7A7]"
                    }`}
                  >
                    {name}
                  </span>
                </div>

                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[#FE512E]"
                      : "border-[#D3D3D3]"
                  }`}
                >
                  {isSelected && (
                    <span className="h-[10.8px] w-[10.8px] rounded-full bg-gradient-to-r from-[#FE512E] to-[#F09619]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-[20px] grid grid-cols-2 gap-[10px]">
          <Button
            type="button"
            onClick={onClose}
            className="h-[51px] rounded-[10px] border border-[#D3D3D3] bg-white text-[18px] font-semibold leading-[24px] text-[#202224] shadow-none hover:bg-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => {
              const selected = paymentMethods.find(
                (method) => method.id === selectedMethod
              );
              onSelectMethod(selected?.type || "card");
            }}
            className="h-[51px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[18px] font-semibold leading-[24px] text-white shadow-none"
          >
            Pay Now
          </Button>
        </div>
    </AppModal>
  );
}