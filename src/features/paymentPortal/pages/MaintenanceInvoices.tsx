// SMS-Frontend/src/features/paymentPortal/pages/MaintenanceInvoices.tsx
import { useState, useEffect } from "react";
import { ChevronDown, Eye, Loader2 } from "lucide-react";
import { cn } from "../../../lib/cn";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import { financialApi } from "../../../services/api";
import toast from "react-hot-toast";

interface Invoice {
  _id: string;
  invoiceId?: string;
  resident?: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
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

export default function MaintenanceInvoices() {
  const [selectedMonth, setSelectedMonth] = useState("Month");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceInvoices = async () => {
      try {
        setLoading(true);
        const response = await financialApi.getMaintenanceRecords();
        setInvoices(response.data || []);
      } catch (error: any) {
        console.error("Error fetching maintenance invoices:", error);
        toast.error(error.message || "Failed to load maintenance invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceInvoices();
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const getMaintenanceAmount = (invoice: Invoice) => {
    return invoice.maintenanceSetup?.maintenanceAmount || invoice.amount || 0;
  };

  const getPendingAmount = (invoice: Invoice) => {
    return invoice.penalty || 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="rounded-[15px] bg-white px-[20px] py-[22px]">
        <div className="flex min-h-[60px] items-center justify-between gap-[16px]">
          <h1 className="text-[20px] font-semibold leading-[28px] text-[#202224]">
            Maintenance Invoices
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthDropdown((prev) => !prev)}
              className="flex h-[40px] min-w-[90px] items-center justify-between gap-[10px] rounded-[8px] border border-[#D9DCE5] bg-white px-[14px] text-[13px] font-medium text-[#202224]"
            >
              {selectedMonth}
              <ChevronDown
                size={15}
                className={cn("transition-transform", showMonthDropdown && "rotate-180")}
              />
            </button>

            {showMonthDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMonthDropdown(false)} />
                <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-[110px] overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white py-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  {["Month", "Year"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(item);
                        setShowMonthDropdown(false);
                      }}
                      className={cn(
                        "block w-full px-[12px] py-[8px] text-left text-[13px] font-medium",
                        selectedMonth === item
                          ? "bg-[#F6F8FB] text-[#202224]"
                          : "text-[#6F7786] hover:bg-[#F6F8FB] hover:text-[#202224]"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[15px] border border-[#D9DCE5] bg-white px-[16px] py-[16px]">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#5678E9]" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-[14px] text-[#6F7786]">No maintenance invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid h-[42px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.25fr_0.55fr] items-center rounded-t-[8px] bg-[#F1F4FF] px-[14px] text-[12px] font-semibold text-[#202224]">
                <div>Invoice ID</div>
                <div>Due Date</div>
                <div>Payment Date</div>
                <div>Maintenance Amount</div>
                <div>Pending Amount</div>
                <div className="text-center">Action</div>
              </div>

              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="grid h-[68px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.25fr_0.55fr] items-center border-b border-[#E8ECEF] px-[14px] text-[12px] font-medium text-[#202224] last:border-b-0"
                >
                  <div>{invoice.invoiceId || invoice._id.slice(-6).toUpperCase()}</div>
                  <div>{formatDate(invoice.date)}</div>
                  <div>{invoice.paymentDate ? formatDate(invoice.paymentDate) : "N/A"}</div>
                  <div className="font-semibold text-[#39973D]">₹ {getMaintenanceAmount(invoice).toLocaleString()}</div>
                  <div className="font-semibold text-[#FF3B30]">{getPendingAmount(invoice).toLocaleString()}</div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleViewInvoice(invoice)}
                      className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F6F8FB] text-[#5678E9] hover:bg-[#5678E9] hover:text-white transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <InvoiceDetailsModal
        open={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}