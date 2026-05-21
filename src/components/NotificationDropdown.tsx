import { X } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import {
  NoNotificationIcon,
  NotificationProfilesIcon,
  NotificationOnlineIcon,
  NotificationCashIcon,
  NotificationGaneshIcon,
} from "../assets/icons/admin-dashboard-icons";
import { cn } from "../lib/cn";

type NotificationItem = {
  id: string | number;
  title: string;
  time: string;
  message: string;
  ago?: string;
  type?: "facility" | "payment" | "complaint" | string;
  details?: { label: string; value: string; color?: string }[];
  status?: "read" | "unread";
};

type NotificationDropdownProps = {
  onClose?: () => void;
};

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, clearNotifications, markAsRead } = useSocket();
  const navigate = useNavigate();
  const list = notifications;
  const hasNotifications = list.length > 0;

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id as string);
    onClose?.();

    const title = item.title.toLowerCase();
    const type = item.type;

    if (title.includes("facility") || type === "facility") {
      navigate("/facility-management");
    } else if (title.includes("announcement")) {
      navigate("/announcement");
    } else if (title.includes("complaint") || type === "complaint") {
      navigate("/complaint-tracking");
    } else if (title.includes("maintenance") || type === "payment") {
      navigate("/financial-management");
    } else if (title.includes("message") || type === "chat") {
      navigate("/community/access-forums");
    }
  };

  if (!hasNotifications) {
    return (
      <div className="fixed left-1/2 top-[86px] z-90 h-[438px] w-[calc(100vw-24px)] max-w-[538px] -translate-x-1/2 rounded-[15px] bg-white px-[16px] py-[16px] shadow-[0_0_40px_rgba(0,0,0,0.05)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[538px] sm:translate-x-0">
        <div className="flex h-[31px] items-center justify-between border-b border-[#F4F4F4] pb-[16px]">
          <h3 className="text-[20px] font-semibold leading-[25px] text-[#202224]">Notification</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="flex h-[calc(100%-31px)] flex-col items-center justify-center pt-[18px]">
          <NoNotificationIcon className="h-[294px] w-[294px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-1/2 top-[86px] z-[90] h-auto max-h-[500px] w-[calc(100vw-24px)] max-w-[540px] -translate-x-1/2 rounded-[15px] bg-white px-[20px] py-[20px] shadow-[0_0_40px_rgba(0,0,0,0.15)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[540px] sm:translate-x-0 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex h-[45px] items-start justify-between border-b border-[#F4F4F4] mb-2">
        <h3 className="text-[20px] font-bold text-[#202224]">Notification</h3>
        <button
          type="button"
          onClick={clearNotifications}
          className="text-[12px] font-semibold text-[#5678E9] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
        {list.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNotificationClick(item)}
            className={cn(
              "border-b border-[#F4F4F4] py-5 last:border-b-0 cursor-pointer transition-all rounded-lg px-2 -mx-2 mb-1",
              (item.title.toLowerCase().includes("emergency") || item.type === "error")
                ? "bg-[#FFF1F1] hover:bg-[#FFE5E5] border-l-4 border-l-[#E74C3C]"
                : "hover:bg-gray-50/50"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon Section */}
              <div className="flex-shrink-0">
                {item.title.toLowerCase().includes("emergency") || item.type === "error" ? (
                  <div className="h-10 w-10 shrink-0 bg-[#FFF1F1] rounded-full flex items-center justify-center border border-[#FFDADA]">
                    <span className="text-[#E74C3C] font-extrabold text-lg">E</span>
                  </div>
                ) : item.title.toLowerCase().includes("warning") || item.type === "warning" ? (
                  <div className="h-10 w-10 shrink-0 bg-[#FFF8EB] rounded-full flex items-center justify-center border border-[#FFE7BA]">
                    <span className="text-[#F39C12] font-extrabold text-lg">W</span>
                  </div>
                ) : item.title.toLowerCase().includes("ganesh") || item.type === "facility" ? (
                  <div className="h-10 w-10 shrink-0 bg-[#F1F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#5678E9] font-bold text-lg">G</span>
                  </div>
                ) : item.title.toLowerCase().includes("maintenance") || item.type === "payment" ? (
                  <div className="h-10 w-10 shrink-0 bg-[#EBFAF2] rounded-full flex items-center justify-center">
                    <NotificationCashIcon className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 bg-[#F1F4FF] rounded-full flex items-center justify-center">
                    <span className="text-[#5678E9] font-bold text-lg">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#202224] leading-tight">{item.title}</h4>
                    <p className="text-[12px] font-medium text-[#A7A7A7] mt-1">{item.time}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="mt-2 space-y-2">
                  {/* Dynamic Details (e.g. Per Person Amount) */}
                  {item.title.toLowerCase().includes("ganesh") && (
                    <p className="text-[14px] font-medium text-[#4F4F4F]">
                      Per Person Amount : <span className="text-[#5678E9]">₹ 1,500</span>
                    </p>
                  )}

                  {/* Main Message */}
                  {item.message && (
                    <p className="text-[14px] font-medium text-[#4F4F4F] leading-[22px]">
                      {item.message}
                    </p>
                  )}

                  {/* Maintenance Table Style */}
                  {(item.title.toLowerCase().includes("maintenance") || item.type === "payment") && (
                    <div className="bg-[#F6F8FB] rounded-xl p-4 mt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[14px] font-medium text-[#4F4F4F]">Maintenance Amount :</span>
                        <span className="text-[14px] font-bold text-[#34A853]">₹ 1,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[14px] font-medium text-[#4F4F4F]">Maintenance Penalty :</span>
                        <span className="text-[14px] font-bold text-[#E74C3C]">₹ 350</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions and Timestamp */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-3">
                    {item.title.toLowerCase().includes("ganesh") ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id as string);
                          }}
                          className="h-[36px] px-8 rounded-[10px] border border-[#D3D3D3] bg-white text-[14px] font-bold text-[#202224] hover:bg-gray-50 transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="h-[36px] px-8 rounded-[10px] bg-[#5678E9] text-[14px] font-bold text-white hover:opacity-90 transition-all"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id as string);
                        }}
                        className="h-[36px] px-2 rounded-[10px] text-sm border border-[#D3D3D3] bg-white text-[14px] font-bold text-[#202224] hover:bg-gray-50 transition-all"
                      >
                        {item.status === 'read' ? 'Read' : 'Mark as Read'}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-medium text-[#A7A7A7]">{item.ago || "Just now"}</span>
                    {item.status === "read" && (
                      <div className="mt-1 flex text-blue-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 13L5 16L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}