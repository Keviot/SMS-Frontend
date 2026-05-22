import { Eye, FileImage, X } from "lucide-react";
import AppModal from "../../../components/modals/AppModal";

type ExpenseViewData = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number | string;
  billName?: string;
  billSize?: string;
  billUrl?: string;
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
    <AppModal
      open={open}
      onClose={onClose}
      title="View Expense Details"
      widthClassName="w-full max-w-[410px]"
      showHeaderDivider
    >
      <div className="flex flex-col gap-5 pt-1">
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

            {data.billUrl ? (
              <a
                href={data.billUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[86px] items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 hover:border-[#5678E9] transition-all no-underline cursor-pointer group"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F6FF] text-[#5678E9] group-hover:bg-[#5678E9] group-hover:text-white transition-colors">
                    <FileImage size={25} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-medium leading-6 text-[#202224] group-hover:text-[#5678E9] transition-colors">
                      {data.billName || "Uploaded Bill"}
                    </p>
                    <p className="mt-1 text-base font-medium leading-5 text-[#A7A7A7]">
                      {data.billSize || "3.5 MB"}
                    </p>
                  </div>
                </div>

                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#A7A7A7] text-white group-hover:bg-[#5678E9] transition-colors"
                >
                  <Eye size={18} />
                </div>
              </a>
            ) : (
              <div className="flex min-h-[86px] items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 opacity-60">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-gray-200 text-gray-400">
                    <FileImage size={25} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-base font-medium leading-6 text-[#202224]">
                      {data.billName || "No Bill Uploaded"}
                    </p>
                    <p className="mt-1 text-base font-medium leading-5 text-[#A7A7A7]">
                      -
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#A7A7A7] text-white opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Eye size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
    </AppModal>
  );
}