import { X } from "lucide-react";
import { notifications } from "../data/dashboard.data";
import {
  NoNotificationIcon,
  NotificationProfilesIcon,
  NotificationOnlineIcon,
  NotificationCashIcon,
  NotificationGaneshIcon,
} from "../assets/icons/admin-dashboard-icons";

type NotificationItem = {
  id: string | number;
  title: string;
  time: string;
  message: string;
  ago?: string;
  amount?: string;
  hasActions?: boolean;
  paymentType?: "cash" | "online";
};

type NotificationDropdownProps = {
  onClose?: () => void;
};

function getNotificationMeta(item: NotificationItem, index: number) {
  const title = item.title.toLowerCase();
  const message = item.message.toLowerCase();

  const isGanesh = title.includes("ganesh");
  const isOnline =
    item.paymentType === "online" ||
    title.includes("maintenance") ||
    message.includes("maintenance") ||
    index === 1;

  return {
    AvatarIcon: isGanesh ? NotificationGaneshIcon : NotificationProfilesIcon,
    PaymentIcon: isOnline ? NotificationOnlineIcon : NotificationCashIcon,
    paymentLabel: isOnline ? "Online" : "Cash",
    paymentClass: isOnline
      ? "bg-[#F1F4FF] text-[#5678E9]"
      : "bg-[#F6F6F6] text-[#202224]",
  };
}

export default function NotificationDropdown({
  onClose,
}: NotificationDropdownProps) {
  /**
   * For testing no-notification UI:
   * change SHOW_EMPTY_NOTIFICATION to true.
   */
  const SHOW_EMPTY_NOTIFICATION = true;

  const list = SHOW_EMPTY_NOTIFICATION
    ? ([] as NotificationItem[])
    : (notifications as NotificationItem[]);

  const hasNotifications = list.length > 0;

  if (!hasNotifications) {
    return (
      <div className="fixed left-1/2 top-[86px] z-90 h-[438px] w-[calc(100vw-24px)] max-w-[538px] -translate-x-1/2 rounded-[15px] bg-white px-[16px] py-[16px] shadow-[0_0_40px_rgba(0,0,0,0.05)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[538px] sm:translate-x-0">
        <div className="flex h-[31px] items-center justify-between border-b border-[#F4F4F4] pb-[16px]">
          <h3 className="text-[20px] font-semibold leading-[25px] text-[#202224]">
            Notification
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="grid h-[24px] w-[24px] place-items-center text-[#202224]"
            aria-label="Close notification"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex h-[calc(100%-31px)] flex-col items-center justify-center pt-[18px]">
          <NoNotificationIcon className="h-[294px] w-[294px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-1/2 top-[86px] z-[90] h-[373px] w-[calc(100vw-24px)] max-w-[540px] -translate-x-1/2 rounded-[15px] bg-white px-[20px] py-[20px] shadow-[0_0_40px_rgba(0,0,0,0.05)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[540px] sm:translate-x-0">
      <div className="flex h-[45px] items-start justify-between border-b border-[#F4F4F4]">
        <h3 className="text-[20px] font-semibold leading-[25px] text-[#202224]">
          Notification
        </h3>

        <button
          type="button"
          className="text-[12px] font-semibold leading-[15px] text-[#5678E9]"
        >
          Clear all
        </button>
      </div>

      <div className="max-h-[288px] overflow-y-auto overflow-x-hidden pr-[2px]">
        {list.slice(0, 2).map((item, index) => {
          const meta = getNotificationMeta(item, index);
          const AvatarIcon = meta.AvatarIcon;
          const PaymentIcon = meta.PaymentIcon;

          return (
            <div
              key={item.id}
              className="border-b border-[#F4F4F4] py-[20px] last:border-b-0"
            >
              <div className="flex items-start gap-[12px]">
                <AvatarIcon className="h-[40px] w-[40px] shrink-0" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-[8px]">
                    <div className="min-w-0">
                      <h4 className="max-w-[170px] truncate text-[16px] font-semibold leading-[20px] text-[#202224] sm:max-w-none">
                        {item.title}
                      </h4>

                      <p className="mt-[3px] text-[12px] font-medium leading-[15px] text-[#A7A7A7]">
                        {item.time}
                      </p>
                    </div>

                    <div
                      className={`flex h-[31px] w-[96px] shrink-0 items-center justify-center gap-[5px] rounded-[58px] px-[12px] py-[5px] text-[14px] font-medium leading-[18px] sm:w-[113px] ${meta.paymentClass}`}
                    >
                      <PaymentIcon className="h-[14px] w-[14px]" />
                      <span>{meta.paymentLabel}</span>
                    </div>
                  </div>

                  <p className="mt-[8px] text-[14px] font-normal leading-[20px] text-[#4F4F4F]">
                    {index === 0 ? (
                      <>
                        Evelyn Harper gave a fund{" "}
                        <span className="text-[#5678E9]">
                          of 1000 rupees for Navratri
                        </span>
                      </>
                    ) : (
                      <>
                        Evelyn Harper gave a{" "}
                        <span className="text-[#5678E9]">
                          Maintenance of 1000 rupees
                        </span>
                      </>
                    )}
                  </p>

                  {item.amount && (
                    <p className="mt-[8px] text-[14px] font-semibold leading-[20px] text-[#202224]">
                      Per Person Amount :{" "}
                      <span className="text-[#FE512E]">{item.amount}</span>
                    </p>
                  )}

                  <div className="mt-[10px] flex items-center justify-between gap-[16px]">
                    <div className="flex items-center gap-[15px]">
                      <button
                        type="button"
                        className="h-[37px] w-[92px] rounded-[10px] border border-[#D3D3D3] bg-white text-[14px] font-medium leading-[18px] text-[#202224] sm:w-[106px]"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="h-[37px] w-[92px] rounded-[10px] bg-[#5678E9] text-[14px] font-medium leading-[18px] text-white sm:w-[106px]"
                      >
                        Decline
                      </button>
                    </div>

                    <span className="shrink-0 text-[12px] font-medium leading-[15px] text-[#A7A7A7]">
                      {item.ago ||
                        (index === 0 ? "32 Minutes ago" : "2 days ago")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}