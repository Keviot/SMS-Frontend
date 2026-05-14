import { X, Download } from "lucide-react";
import Button from "../../../ui/Button";

interface Invoice {
    id: string;
    invoiceId: string;
    ownerName: string;
    billDate: string;
    paymentDate: string;
    maintenanceAmount: number;
    pendingAmount: number;
}

interface InvoiceDetailsModalProps {
    open: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export default function InvoiceDetailsModal({
    open,
    onClose,
    invoice,
}: InvoiceDetailsModalProps) {
    if (!open || !invoice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <h2 className="mb-6 text-xl font-semibold text-[#202224]">
                    Maintenance Invoices
                </h2>

                {/* Invoice Details */}
                <div className="mb-6 space-y-4">
                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Invoice Id</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            {invoice.invoiceId}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Owner Name</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            {invoice.ownerName}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Bill Date</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            {invoice.billDate}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Payment Date</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            {invoice.paymentDate}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Phone Number</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            9548787512
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Email</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            Marylandgarcia@gmail.com
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium text-[#6F7786]">Address</div>
                        <div className="mt-1 text-sm font-semibold text-[#202224]">
                            2118 Thornridge Cir. Syracuse, Connecticut 35624
                        </div>
                    </div>
                </div>

                {/* Amount Summary */}
                <div className="mb-6 space-y-3 rounded-xl bg-[#F6F8FB] p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#6F7786]">Maintenance Amount</span>
                        <span className="font-semibold text-[#39973D]">
                            ₹ {invoice.maintenanceAmount.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#6F7786]">Penalty</span>
                        <span className="font-semibold text-[#E74C3C]">₹ 350.00</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-base">
                        <span className="font-semibold text-[#202224]">Grand Total</span>
                        <span className="font-bold text-[#202224]">
                            ₹ {(invoice.maintenanceAmount + 350).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Note */}
                <div className="mb-6">
                    <p className="text-xs leading-relaxed text-[#6F7786]">
                        A visual representation of your spending categories visual representation.
                    </p>
                </div>

                {/* Download Button */}
                <Button
                    leftIcon={<Download size={18} />}
                    className="w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(254,81,46,0.22)]"
                >
                    Download Invoice
                </Button>
            </div>
        </div>
    );
}
