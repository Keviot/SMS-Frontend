import { notifications } from "../../data/dashboard.data";

type NotificationItem = {
  id: string | number;
  title: string;
  time: string;
  message: string;
  ago?: string;
  amount?: string;
  paymentType?: "Cash" | "Online";
  hasActions?: boolean;
};

export default function NotificationDropdown() {
  const list = notifications as NotificationItem[];

  return (
    <div className="absolute right-0 top-[calc(100%+14px)] z-[90] w-[344px] overflow-hidden rounded-[10px] border border-[#F1F1F1] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex h-[42px] items-center justify-between border-b border-[#F1F1F1] px-[14px]">
        <h3 className="font-poppins text-[13px] font-semibold leading-none text-[#202224]">
          Notification
        </h3>

        <button
          type="button"
          className="font-poppins text-[10px] font-medium leading-none text-[#5678E9] transition hover:opacity-80"
        >
          Clear all
        </button>
      </div>

      {/* Empty State */}
      {list.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center">
          <p className="font-poppins text-[13px] font-medium text-[#A6A6A6]">
            No notification yet!
          </p>
        </div>
      ) : (
        <div className="max-h-[390px] overflow-y-auto">
          {list.map((item) => (
            <div
              key={item.id}
              className="border-b border-[#F5F5F5] px-[14px] py-[12px] last:border-b-0"
            >
              <div className="flex gap-[9px]">
                {/* Avatar */}
                <div className="mt-[1px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#FFF1E8] font-poppins text-[12px] font-semibold text-[#FF6B2C]">
                  {item.title?.charAt(0)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Title + Payment Tag */}
                  <div className="flex items-start justify-between gap-[8px]">
                    <h4 className="max-w-[190px] truncate font-poppins text-[11px] font-semibold leading-[15px] text-[#202224]">
                      {item.title}
                    </h4>

                    {item.paymentType && (
                      <span
                        className={
                          item.paymentType === "Online"
                            ? "rounded-[4px] bg-[#5678E91A] px-[8px] py-[3px] font-poppins text-[9px] font-medium leading-none text-[#5678E9]"
                            : "rounded-[4px] bg-[#F8F8F8] px-[8px] py-[3px] font-poppins text-[9px] font-medium leading-none text-[#202224]"
                        }
                      >
                        {item.paymentType}
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <p className="mt-[3px] font-poppins text-[9px] font-medium leading-[13px] text-[#A6A6A6]">
                    {item.time}
                  </p>

                  {/* Message */}
                  <p className="mt-[7px] font-poppins text-[10px] font-normal leading-[15px] text-[#4F4F4F]">
                    {item.message}
                  </p>

                  {/* Amount */}
                  {item.amount && (
                    <p className="mt-[7px] font-poppins text-[10px] font-normal leading-[15px] text-[#4F4F4F]">
                      Per Person Amount :{" "}
                      <span className="font-semibold text-[#202224]">
                        {item.amount}
                      </span>
                    </p>
                  )}

                  {/* Actions + Ago */}
                  <div className="mt-[9px] flex items-center justify-between gap-[10px]">
                    {item.hasActions ? (
                      <div className="flex items-center gap-[7px]">
                        <button
                          type="button"
                          className="h-[24px] rounded-[4px] bg-[#D3D3D3] px-[14px] font-poppins text-[10px] font-medium text-[#202224] transition hover:opacity-85"
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          className="h-[24px] rounded-[4px] bg-[#5678E9] px-[14px] font-poppins text-[10px] font-medium text-white transition hover:opacity-85"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div />
                    )}

                    {item.ago && (
                      <p className="whitespace-nowrap font-poppins text-[9px] font-medium leading-none text-[#A6A6A6]">
                        {item.ago}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}