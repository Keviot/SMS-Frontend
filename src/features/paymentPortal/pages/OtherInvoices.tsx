import { useState } from "react";
import Button from "../../../ui/Button";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import PaymentMethodModal from "../components/PaymentMethodModal";
import CardPaymentModal from "../components/CardPaymentModal";
import toast from "react-hot-toast";

interface EventInvoice {
  id: string;
  invoiceId: string;
  eventName: string;
  eventDueDate: string;
  amount: number;
  status: "pending" | "paid";
}

const mockEventInvoices: EventInvoice[] = [
  {
    id: "1",
    invoiceId: "152563",
    eventName: "Navratri",
    eventDueDate: "11/01/2024",
    amount: 1000,
    status: "pending",
  },
  {
    id: "2",
    invoiceId: "152564",
    eventName: "Navratri",
    eventDueDate: "11/01/2024",
    amount: 1000,
    status: "pending",
  },
  {
    id: "3",
    invoiceId: "152565",
    eventName: "Navratri",
    eventDueDate: "11/01/2024",
    amount: 1000,
    status: "pending",
  },
  {
    id: "4",
    invoiceId: "152566",
    eventName: "Navratri",
    eventDueDate: "11/01/2024",
    amount: 1000,
    status: "pending",
  },
];

export default function OtherInvoices() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCardPaymentModal, setShowCardPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EventInvoice | null>(
    null
  );

  const handleViewInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handlePayNow = (invoice: EventInvoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentMethodModal(true);
  };

  const handleSelectPaymentMethod = (method: string) => {
    setShowPaymentMethodModal(false);

    if (method === "card") {
      setShowCardPaymentModal(true);
      return;
    }

    setSelectedInvoice(null);
    toast.success("Cash payment selected");
  };

  const handleCardPaymentSubmit = (data: any) => {
    console.log("Card payment data:", data);
    setShowCardPaymentModal(false);
    setSelectedInvoice(null);
    toast.success("Payment processed successfully!");
  };

  return (
    <div className="w-full">
      <section className="w-full rounded-[15px] bg-white px-[20px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between gap-[16px]">
          <h1 className="text-[16px] font-semibold leading-[22px] text-[#202224]">
            Due Event Payment
          </h1>

          <Button
            onClick={handleViewInvoice}
            className="h-[40px] rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-[20px] text-[12px] font-semibold text-white shadow-none"
          >
            View Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
          {mockEventInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="overflow-hidden rounded-[10px] border border-[#D9DCE5] bg-white"
            >
              <div className="flex h-[54px] items-center justify-between bg-[#5678E9] px-[12px]">
                <h2 className="text-[13px] font-semibold leading-[18px] text-white">
                  Due Event Payment
                </h2>

                <span className="rounded-[58px] bg-white/10 px-[12px] py-[5px] text-[11px] font-medium leading-[15px] text-white">
                  Pending
                </span>
              </div>

              <div className="px-[12px] pb-[12px] pt-[12px]">
                <div className="space-y-[10px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                      Event Name
                    </span>
                    <span className="text-[11px] font-medium leading-[15px] text-[#A7A7A7]">
                      {invoice.eventName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-[12px]">
                    <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                      Event Due Date
                    </span>
                    <span className="text-[11px] font-medium leading-[15px] text-[#A7A7A7]">
                      {invoice.eventDueDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-[12px]">
                    <span className="text-[11px] font-medium leading-[15px] text-[#6F7786]">
                      Amount
                    </span>
                    <span className="text-[11px] font-medium leading-[15px] text-[#FF0000]">
                      {invoice.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePayNow(invoice)}
                  className="mt-[14px] h-[40px] w-full rounded-[8px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[12px] font-semibold text-white shadow-none"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <InvoiceDetailsModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Event Invoices List"
        invoice={{
          id: mockEventInvoices[0].id,
          invoiceId: mockEventInvoices[0].invoiceId,
          ownerName: "Terry Rhiel Madsen",
          billDate: mockEventInvoices[0].eventDueDate,
          paymentDate: mockEventInvoices[0].eventDueDate,
          maintenanceAmount: mockEventInvoices[0].amount,
          pendingAmount: 0,
        }}
      />

      <PaymentMethodModal
        open={showPaymentMethodModal}
        onClose={() => {
          setShowPaymentMethodModal(false);
          setSelectedInvoice(null);
        }}
        onSelectMethod={handleSelectPaymentMethod}
      />

      <CardPaymentModal
        open={showCardPaymentModal}
        onClose={() => {
          setShowCardPaymentModal(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleCardPaymentSubmit}
      />
    </div>
  );
}