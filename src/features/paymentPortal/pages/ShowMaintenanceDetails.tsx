import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/Button";
import PaymentMethodModal from "../components/PaymentMethodModal";
import CardPaymentModal from "../components/CardPaymentModal";

interface MaintenanceCard {
  id: string;
  type: "pending" | "due";
  billDate?: string;
  pendingDate?: string;
  date?: string;
  maintenanceAmount: number;
  penaltyAmount: number;
  grandTotal: number;
}

const mockPendingMaintenance: MaintenanceCard[] = [
  {
    id: "1",
    type: "pending",
    billDate: "10/01/2024",
    pendingDate: "10/01/2024",
    maintenanceAmount: 1000.0,
    penaltyAmount: 250.0,
    grandTotal: 1250,
  },
  {
    id: "2",
    type: "pending",
    billDate: "10/01/2024",
    pendingDate: "10/01/2024",
    maintenanceAmount: 1000.0,
    penaltyAmount: 250.0,
    grandTotal: 1250,
  },
  {
    id: "3",
    type: "pending",
    billDate: "10/01/2024",
    pendingDate: "10/01/2024",
    maintenanceAmount: 1000.0,
    penaltyAmount: 250.0,
    grandTotal: 1250,
  },
];

const mockDueMaintenance: MaintenanceCard[] = [
  {
    id: "4",
    type: "due",
    date: "10/01/2024",
    maintenanceAmount: 1000.0,
    penaltyAmount: 250.0,
    grandTotal: 1250,
  },
  {
    id: "5",
    type: "due",
    date: "10/01/2024",
    maintenanceAmount: 1000.0,
    penaltyAmount: 250.0,
    grandTotal: 1250,
  },
];

export default function ShowMaintenanceDetails() {
  const navigate = useNavigate();
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCardPaymentModal, setShowCardPaymentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MaintenanceCard | null>(null);

  const handlePayNow = (card: MaintenanceCard) => {
    setSelectedCard(card);
    setShowPaymentMethodModal(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setShowPaymentMethodModal(false);
    if (method === "card") {
      setShowCardPaymentModal(true);
    }
  };

  const handleCardPayment = (cardData: any) => {
    console.log("Processing payment:", cardData);
    setShowCardPaymentModal(false);
    setSelectedCard(null);
  };

  const handleViewInvoice = () => {
    navigate("/payment-portal/maintenance-invoices");
  };

  return (
    <div className="space-y-[18px]">
      {/* Header with Amount Cards */}
      <div className="rounded-[15px] bg-white px-[16px] py-[16px]">
        <div className="flex min-h-[100px] flex-col gap-[16px] lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-[18px] font-semibold leading-[24px] text-[#202224]">
            Show Maintenance Details
          </h1>

          <div className="grid w-full grid-cols-1 gap-[10px] sm:grid-cols-2 lg:w-[482px]">
            <div className="h-[100px] rounded-[10px] border border-[#E8ECEF] border-l-[3px] border-l-[#39973D] bg-white px-[16px] py-[16px] shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <p className="text-[13px] font-medium leading-[18px] text-[#202224]">
                Maintenance Amount
              </p>
              <p className="mt-[8px] text-[24px] font-bold leading-[30px] text-[#39973D]">
                ₹ 1,500
              </p>
            </div>

            <div className="h-[100px] rounded-[10px] border border-[#E8ECEF] border-l-[3px] border-l-[#FF8A8A] bg-white px-[16px] py-[16px] shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <p className="text-[13px] font-medium leading-[18px] text-[#202224]">
                Penalty Amount
              </p>
              <p className="mt-[8px] text-[24px] font-bold leading-[30px] text-[#E74C3C]">
                ₹ 500
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Maintenance Section */}
      <div className="rounded-[15px] bg-white px-[16px] py-[16px]">
        <div className="mb-[20px] flex items-center justify-between gap-[12px]">
          <h2 className="text-[16px] font-semibold leading-[22px] text-[#202224]">
            Pending Maintenance
          </h2>

          <button
            type="button"
            onClick={handleViewInvoice}
            className="h-[42px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-[20px] text-[14px] font-semibold leading-[20px] text-white"
          >
            View Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {mockPendingMaintenance.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden rounded-[10px] border border-[#D9DCE5] bg-white"
            >
              <div className="flex h-[42px] items-center justify-between bg-[#5678E9] px-[12px]">
                <span className="text-[13px] font-semibold leading-[18px] text-white">
                  Maintenance
                </span>
                <span className="rounded-full bg-white/15 px-[15px] py-[4px] text-[11px] font-semibold leading-[14px] text-white">
                  Pending
                </span>
              </div>

              <div className="bg-white px-[12px] pt-[12px]">
                <div className="space-y-[10px]">
                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">Bill Date</span>
                    <span className="font-medium text-[#202224]">{card.billDate}</span>
                  </div>

                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">Pending Date</span>
                    <span className="font-medium text-[#202224]">{card.pendingDate}</span>
                  </div>

                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">
                      Maintenance Amount
                    </span>
                    <span className="font-semibold text-[#FF3B30]">
                      {card.maintenanceAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">
                      Maintenance Penalty Amount
                    </span>
                    <span className="font-semibold text-[#FF3B30]">
                      {card.penaltyAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-[10px] border-t border-[#E8ECEF] pt-[10px] text-[12px] leading-[16px]">
                    <span className="font-semibold text-[#202224]">Grand Total</span>
                    <span className="font-bold text-[#202224]">
                      ₹ {card.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white px-[12px] pb-[12px] pt-[10px]">
                <Button
                  onClick={() => handlePayNow(card)}
                  className="h-[40px] w-full rounded-[8px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[13px] font-semibold leading-[18px] text-white shadow-none"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Maintenance Section */}
      <div className="rounded-[15px] bg-white px-[16px] py-[16px]">
        <h2 className="mb-[20px] text-[16px] font-semibold leading-[22px] text-[#202224]">
          Due Maintenance
        </h2>

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {mockDueMaintenance.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden rounded-[10px] border border-[#D9DCE5] bg-white"
            >
              <div className="flex h-[42px] items-center justify-between bg-[#5678E9] px-[12px]">
                <span className="text-[13px] font-semibold leading-[18px] text-white">
                  Maintenance
                </span>
                <span className="rounded-full bg-white/15 px-[15px] py-[4px] text-[11px] font-semibold leading-[14px] text-white">
                  Pending
                </span>
              </div>

              <div className="bg-white px-[12px] pt-[12px]">
                <div className="space-y-[10px]">
                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">Date</span>
                    <span className="font-medium text-[#202224]">{card.date}</span>
                  </div>

                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">Amount</span>
                    <span className="font-semibold text-[#FF3B30]">
                      {card.maintenanceAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-[10px] text-[12px] leading-[16px]">
                    <span className="font-medium text-[#6F7786]">
                      Due Maintenance Amount
                    </span>
                    <span className="font-semibold text-[#FF3B30]">
                      {card.penaltyAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white px-[12px] pb-[12px] pt-[10px]">
                <Button
                  onClick={() => handlePayNow(card)}
                  className="h-[40px] w-full rounded-[8px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[13px] font-semibold leading-[18px] text-white shadow-none"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PaymentMethodModal
        open={showPaymentMethodModal}
        onClose={() => {
          setShowPaymentMethodModal(false);
          setSelectedCard(null);
        }}
        onSelectMethod={handlePaymentMethodSelect}
      />

      <CardPaymentModal
        open={showCardPaymentModal}
        onClose={() => {
          setShowCardPaymentModal(false);
          setSelectedCard(null);
        }}
        onSubmit={handleCardPayment}
      />
    </div>
  );
}