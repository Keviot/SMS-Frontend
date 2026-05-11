import { X } from "lucide-react";
import { notifications } from "../../data/dashboard.data";
import {
  NoNotificationIcon,
  NotificationProfilesIcon,
  NotificationOnlineIcon,
  NotificationCashIcon,
  NotificationGaneshIcon,
} from "../../assets/icons/admin-dashboard-icons";

type NotificationItem = {
  id: string | number;
  title: string;
  time: string;
  message: string;
  ago?: string;
  type?: "facility" | "payment" | "complaint";
  details?: { label: string; value: string; color?: string }[];
  status?: "read" | "unread";
};

type NotificationDropdownProps = {
  onClose?: () => void;
};

// Mock data for the specific image
const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New Facility Created.",
    time: "Monday 11:41 AM",
    message: "",
    ago: "32 Minutes ago",
    type: "facility",
    status: "read",
    details: [
      { label: "Name", value: "Parking Facility", color: "text-[#5678E9]" },
      { label: "Schedule Date", value: "01/02/2024" },
    ],
  },
  {
    id: 2,
    title: "New Maintenance Added",
    time: "Monday 11:41 AM",
    message: "",
    ago: "2 days ago",
    type: "payment",
    status: "unread",
    details: [
      { label: "Amount", value: "₹ 1,500", color: "text-[#FE512E]" },
      { label: "Category", value: "Maintenance" },
    ],
  },
];

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const list = mockNotifications;
  const hasNotifications = list.length > 0;

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
        <button type="button" className="text-[12px] font-semibold text-[#5678E9] hover:underline">Clear all</button>
      </div>

      <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {list.map((item) => (
          <div key={item.id} className="border-b border-[#F4F4F4] py-5 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 bg-[#F1F4FF] rounded-full flex items-center justify-center">
                <span className="text-[#5678E9] font-bold text-lg">
                  {item.type === "facility" ? "F" : item.type === "payment" ? "P" : "C"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#202224] leading-tight">{item.title}</h4>
                    <p className="text-[12px] font-medium text-[#A7A7A7] mt-0.5">{item.time}</p>
                  </div>
                </div>

                {item.details && (
                  <div className="mt-3 space-y-1">
                    {item.details.map((detail, idx) => (
                      <p key={idx} className="text-[14px] font-medium text-[#4F4F4F]">
                        {detail.label} : <span className={detail.color || "text-[#202224]"}>{detail.value}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="h-[36px] px-8 rounded-[10px] border border-[#D3D3D3] bg-white text-[14px] font-bold text-[#202224] hover:bg-gray-50 transition-all">
                      View
                    </button>
                    <button className="h-[36px] px-8 rounded-[10px] bg-[#5678E9] text-[14px] font-bold text-white hover:opacity-90 transition-all">
                      Ignore
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[12px] font-medium text-[#A7A7A7]">{item.ago}</span>
                    {item.status === "read" && (
                      <div className="flex text-blue-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 13L5 16L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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