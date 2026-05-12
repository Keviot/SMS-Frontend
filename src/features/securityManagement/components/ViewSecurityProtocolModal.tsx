import { X } from "lucide-react";

type SecurityProtocolViewData = {
  title: string;
  description: string;
  date: string;
  time: string;
};

type ViewSecurityProtocolModalProps = {
  open: boolean;
  onClose: () => void;
  data: SecurityProtocolViewData | null;
};

export default function ViewSecurityProtocolModal({
  open,
  onClose,
  data,
}: ViewSecurityProtocolModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <h2 className="text-xl font-bold leading-6 text-[#202224]">
            View Security Protocol
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close view security protocol modal"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[#202224] transition hover:bg-[#F6F8FB]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Title
            </p>
            <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
              {data.title}
            </p>
          </div>

          <div>
            <p className="text-base font-medium leading-5 text-[#A7A7A7]">
              Description
            </p>
            <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
              {data.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Date
              </p>
              <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
                {data.date}
              </p>
            </div>

            <div>
              <p className="text-base font-medium leading-5 text-[#A7A7A7]">
                Time
              </p>
              <p className="mt-2 text-base font-medium leading-6 text-[#202224]">
                {data.time}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}