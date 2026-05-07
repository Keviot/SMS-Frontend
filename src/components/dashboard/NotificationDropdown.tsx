import { notifications } from "../../data/dashboard.data";

type NotificationItem = {
  id: string | number;
  title: string;
  time: string;
  message: string;
  ago?: string;
  amount?: string;
  hasActions?: boolean;
};

export default function NotificationDropdown() {
  const list = notifications as NotificationItem[];

  return (
    <div className="absolute right-0 top-[calc(100%+14px)] z-[90] w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[10px] border border-[#F1F1F1] bg-white shadow-[0_18px_52px_rgba(15,23,42,0.15)]">
      <div className="flex h-[46px] items-center justify-between border-b border-[#F1F1F1] px-[16px]">
        <h3 className="text-[14px] font-semibold text-[#202224]">Notification</h3>
        <button type="button" className="text-[12px] font-medium text-[#5678E9]">Clear all</button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {list.map((item, index) => (
          <div key={item.id} className="border-b border-[#F1F1F1] px-[16px] py-[14px] last:border-b-0">
            <div className="flex items-start gap-[10px]">
              <div className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full bg-[#5678E9] text-[13px] font-semibold text-white">
                {item.title.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-[8px]">
                  <p className="text-[12px] font-semibold leading-[17px] text-[#202224]">{item.title}</p>
                  <span className="shrink-0 text-[10px] font-medium text-[#A7A7A7]">{item.time}</span>
                </div>
                <p className="mt-[7px] text-[11px] font-normal leading-[17px] text-[#4F4F4F]">{item.message}</p>
                {item.amount && <p className="mt-[6px] text-[12px] font-semibold text-[#202224]">Per Person Amount : <span className="text-[#FE512E]">{item.amount}</span></p>}
                <div className="mt-[10px] flex items-center justify-between gap-[10px]">
                  {item.hasActions ? (
                    <div className="flex gap-[8px]">
                      <button type="button" className="h-[28px] rounded-[5px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-[13px] text-[11px] font-medium text-white">Accept</button>
                      <button type="button" className="h-[28px] rounded-[5px] border border-[#D3D3D3] bg-white px-[13px] text-[11px] font-medium text-[#202224]">Decline</button>
                    </div>
                  ) : <span />}
                  <span className="text-[10px] font-medium text-[#A7A7A7]">{item.ago || (index === 0 ? "32 Minutes ago" : "2 days ago")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
