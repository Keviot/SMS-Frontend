import { Eye, FileImage, X } from "lucide-react";

type ExpenseViewData = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number | string;
  billName?: string;
  billSize?: string;
};

interface ExpenseViewModalProps {
  open: boolean;
  onClose: () => void;
  data: ExpenseViewData | null;
}

export default function ExpenseViewModal({
  open,
  onClose,
  data,
}: ExpenseViewModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[410px] rounded-[15px] bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <h2 className="text-xl font-bold leading-6 text-[#202224]">
            View Expense Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[#202224] transition hover:bg-[#F6F8FB]"
            aria-label="Close view expense modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Title
            </p>
            <p className="text-base font-medium leading-6 text-[#202224]">
              {data.title}
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Description
            </p>
            <p className="text-base font-medium leading-6 text-[#202224]">
              {data.description}
            </p>
          </div>

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-14">
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Date
              </p>
              <p className="text-base font-medium leading-6 text-[#202224]">
                {data.date}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Amount
              </p>

              <div className="flex h-9 w-fit min-w-[113px] items-center justify-center rounded-full bg-[#F6F6F6] px-4 text-base font-semibold text-[#202224]">
                ₹ {data.amount}
              </div>
            </div>
          </div>

          {/* Bill */}
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Bill
            </p>

            <div className="flex min-h-[86px] items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F6FF] text-[#5678E9]">
                  <FileImage size={25} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-medium leading-6 text-[#202224]">
                    {data.billName || "Adharcard Front Side.JPG"}
                  </p>
                  <p className="mt-1 text-base font-medium leading-5 text-[#A7A7A7]">
                    {data.billSize || "3.5 MB"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#A7A7A7] text-white"
                aria-label="View bill"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}