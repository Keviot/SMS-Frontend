import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { cn } from "../../../lib/cn";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";

interface Invoice {
    id: string;
    invoiceId: string;
    ownerName: string;
    billDate: string;
    paymentDate: string;
    maintenanceAmount: number;
    pendingAmount: number;
}

const mockInvoices: Invoice[] = [
    {
        id: "1",
        invoiceId: "152563",
        ownerName: "Terry Rhiel Madsen",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 2500,
    },
    {
        id: "2",
        invoiceId: "152563",
        ownerName: "Marcus",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 6500,
    },
    {
        id: "3",
        invoiceId: "152563",
        ownerName: "Jemela Eleni",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 7500,
    },
    {
        id: "4",
        invoiceId: "152563",
        ownerName: "Albern",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 8500,
    },
    {
        id: "5",
        invoiceId: "152563",
        ownerName: "Terry Rhiel",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 3500,
    },
    {
        id: "6",
        invoiceId: "152563",
        ownerName: "Marcus",
        billDate: "10/02/2024",
        paymentDate: "10/02/2024",
        maintenanceAmount: 1500,
        pendingAmount: 2500,
    },
];

export default function MaintenanceInvoices() {
    const [selectedMonth, setSelectedMonth] = useState("Month");
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
    };

    return (
        <div className="flex flex-col gap-[16px]">
            {/* Top title card */}
            <div className="rounded-[15px] bg-white px-[20px] py-[16px]">
                <div className="flex min-h-[68px] items-center justify-between gap-[16px]">
                    <h1 className="text-[20px] font-semibold leading-[28px] text-[#202224]">
                        Maintenance Invoices
                    </h1>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowMonthDropdown((prev) => !prev)}
                            className="flex h-[40px] min-w-[94px] items-center justify-between gap-[10px] rounded-[8px] border border-[#D9DCE5] bg-white px-[14px] text-[13px] font-medium leading-[18px] text-[#202224]"
                        >
                            {selectedMonth}
                            <ChevronDown
                                size={15}
                                className={cn(
                                    "transition-transform",
                                    showMonthDropdown && "rotate-180"
                                )}
                            />
                        </button>

                        {showMonthDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setShowMonthDropdown(false)}
                                />
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
                                                "block w-full px-[12px] py-[8px] text-left text-[13px] font-medium leading-[18px]",
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

            {/* Table card */}
            <div className="rounded-[15px] border border-[#D9DCE5] bg-white px-[16px] py-[16px]">
                <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                        {/* Header */}
                        <div className="grid h-[43px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.2fr_0.55fr] items-center rounded-t-[10px] bg-[#F1F4FF] px-[14px] text-[12px] font-semibold leading-[16px] text-[#202224]">
                            <div>Invoice ID</div>
                            <div>Due Date</div>
                            <div>Payment Date</div>
                            <div>Maintenance Amount</div>
                            <div>Pending Amount</div>
                            <div className="text-center">Action</div>
                        </div>

                        {/* Body */}
                        <div>
                            {mockInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="grid h-[68px] grid-cols-[1fr_1.25fr_1.25fr_1.35fr_1.2fr_0.55fr] items-center border-b border-[#E8ECEF] px-[14px] text-[12px] font-medium leading-[16px] text-[#202224] last:border-b-0"
                                >
                                    <div>{invoice.invoiceId}</div>
                                    <div>{invoice.billDate}</div>
                                    <div>{invoice.paymentDate}</div>

                                    <div className="font-semibold text-[#39973D]">
                                        ₹ {invoice.maintenanceAmount}
                                    </div>

                                    <div className="font-semibold text-[#FF3B30]">
                                        {invoice.pendingAmount}
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleViewInvoice(invoice)}
                                            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#F6F8FB] text-[#5678E9]"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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