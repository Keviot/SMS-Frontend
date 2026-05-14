import { X, Download } from "lucide-react";
import Button from "../../../ui/Button";

interface Invoice {
  _id: string;
  invoiceId?: string;
  resident?: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    email?: string;
    wing?: string;
    unit?: string;
  };
  date: string;
  paymentDate?: string;
  maintenanceSetup?: {
    maintenanceAmount: number;
  };
  amount?: number;
  penalty?: number;
  status: string;
}

interface InvoiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  title?: string;
}

export default function InvoiceDetailsModal({
  open,
  onClose,
  invoice,
  title = "Maintenance Invoices",
}: InvoiceDetailsModalProps) {
  if (!open || !invoice) return null;

  const isEventInvoice = title === "Event Invoices List";

  const getOwnerName = () => {
    if (invoice.resident?.name) return invoice.resident.name;
    if (invoice.resident?.firstname && invoice.resident?.lastname) {
      return `${invoice.resident.firstname} ${invoice.resident.lastname}`;
    }
    return "N/A";
  };

  const getMaintenanceAmount = () => {
    return invoice.maintenanceSetup?.maintenanceAmount || invoice.amount || 0;
  };

  const getPenalty = () => {
    return invoice.penalty || 0;
  };

  const getGrandTotal = () => {
    return getMaintenanceAmount() + getPenalty();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getAddress = () => {
    const wing = invoice.resident?.wing || "";
    const unit = invoice.resident?.unit || "";
    return wing && unit ? `Wing ${wing}, Unit ${unit}` : "N/A";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-[60px]">
      <div className="relative w-full max-w-[410px] rounded-[15px] bg-white p-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[14px] top-[14px] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-[#202224]"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <h2 className="mb-[20px] pr-[36px] text-[18px] font-semibold leading-[24px] text-[#202224]">
          {title}
        </h2>

        <div className="rounded-[10px] bg-[#F6F8FB] px-[14px] py-[12px]">
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
            <InfoItem label="Invoice Id" value={invoice.invoiceId || invoice._id.slice(-6).toUpperCase()} />
            <InfoItem label="Owner Name" value={getOwnerName()} />
            <InfoItem label="Bill Date" value={formatDate(invoice.date)} />
            <InfoItem label="Payment Date" value={invoice.paymentDate ? formatDate(invoice.paymentDate) : "N/A"} />
            {isEventInvoice && (
              <>
                <InfoItem label="Event Date" value="6549873521" />
                <InfoItem label="Phone Number" value="6549873521" />
              </>
            )}
          </div>

          {isEventInvoice ? (
            <>
              <div className="mt-[16px]">
                <InfoItem label="Email" value="MaryDHurst@jourrapide.com" />
              </div>

              <div className="mt-[16px]">
                <InfoItem label="Event Name" value="Ganesh Chaturthi" />
              </div>

              <div className="mt-[16px]">
                <p className="text-[12px] font-medium leading-[16px] text-[#A7A7A7]">
                  Description
                </p>
                <p className="mt-[6px] text-[13px] font-medium leading-[20px] text-[#202224]">
                  The celebration of Ganesh Chaturthi involves the installation
                  of clay idols of Lord Ganesa in&nbsp; OurResident.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mt-[16px]">
                <InfoItem label="Phone Number" value={invoice.resident?.phoneNumber || "N/A"} />
              </div>

              <div className="mt-[16px]">
                <InfoItem label="Email" value={invoice.resident?.email || "N/A"} />
              </div>

              <div className="mt-[16px]">
                <InfoItem
                  label="Address"
                  value={getAddress()}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-[16px] overflow-hidden rounded-[10px] border border-[#D3D3D3] bg-[#F6F8FB]">
          <div className="flex items-center justify-between px-[14px] py-[12px]">
            <span className="text-[13px] font-medium leading-[18px] text-[#202224]">
              Maintenance Amount
            </span>
            <span className="text-[13px] font-medium leading-[18px] text-[#39973D]">
              ₹ {getMaintenanceAmount().toLocaleString()}
            </span>
          </div>

          {!isEventInvoice && (
            <div className="flex items-center justify-between px-[14px] pb-[12px]">
              <span className="text-[13px] font-medium leading-[18px] text-[#202224]">
                Penalty
              </span>
              <span className="text-[13px] font-medium leading-[18px] text-[#FF3B30]">
                ₹ {getPenalty().toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#D3D3D3] px-[14px] py-[12px]">
            <span className="text-[13px] font-semibold leading-[18px] text-[#202224]">
              Grand Total
            </span>
            <span className="text-[13px] font-semibold leading-[18px] text-[#202224]">
              ₹ {getGrandTotal().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-[16px] rounded-[10px] bg-[#F6F8FB] px-[14px] py-[12px]">
          <p className="text-[12px] font-medium leading-[16px] text-[#A7A7A7]">
            Note
          </p>
          <p className="mt-[6px] text-[13px] font-medium leading-[20px] text-[#202224]">
            Status: <span className="font-semibold capitalize">{invoice.status}</span>
          </p>
        </div>

        <Button
          leftIcon={<Download size={16} />}
          className="mt-[16px] h-[51px] w-full rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] text-[14px] font-semibold text-white shadow-none"
        >
          Download Invoice
        </Button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-medium leading-[16px] text-[#A7A7A7]">
        {label}
      </p>
      <p className="mt-[5px] text-[13px] font-medium leading-[18px] text-[#202224]">
        {value}
      </p>
    </div>
  );
}