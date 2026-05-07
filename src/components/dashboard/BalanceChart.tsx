import { ChevronDown } from "lucide-react";
import Card from "../../ui/Card";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const values = [10, 16, 14, 27, 18, 24, 20, 30, 29, 28, 40, 48];
const max = 50;

export default function BalanceChart() {
  const points = values
    .map((value, index) => {
      const x = 6 + (index / (values.length - 1)) * 88;
      const y = 92 - (value / max) * 78;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="h-[398px] p-[20px]">
      <div className="flex items-start justify-between gap-[14px]">
        <div>
          <h2 className="text-[20px] font-semibold leading-[24px] text-[#202224]">Total Balance</h2>
          <p className="mt-[18px] text-[32px] font-semibold leading-[38px] text-[#202224]">55,000</p>
        </div>

        <div className="relative">
          <button className="flex h-[45px] min-w-[115px] items-center justify-between rounded-[10px] border border-[#D3D3D3] bg-white px-[14px] text-[14px] font-semibold text-[#202224]">
            Month <ChevronDown size={18} />
          </button>
          <div className="absolute right-0 top-[55px] z-10 w-[150px] rounded-[10px] bg-white p-[14px] shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            {["Last week", "Last month", "Last Year"].map((item) => (
              <label key={item} className="mb-[12px] flex items-center gap-[10px] last:mb-0">
                <span className={`grid h-[17px] w-[17px] place-items-center rounded-full border ${item === "Last month" ? "border-[#FE512E]" : "border-[#C9CDD5]"}`}>
                  {item === "Last month" && <span className="h-[9px] w-[9px] rounded-full bg-[#FE512E]" />}
                </span>
                <span className={`text-[13px] font-medium ${item === "Last month" ? "text-[#202224]" : "text-[#A7A7A7]"}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[22px] h-[270px]">
        <div className="grid h-full grid-cols-[45px_1fr]">
          <div className="flex h-[220px] flex-col justify-between pt-[3px] text-[15px] font-normal text-[#4F4F4F]">
            {["50k", "40k", "30k", "20k", "10k", "0k"].map((label) => <span key={label}>{label}</span>)}
          </div>

          <div className="min-w-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[220px] w-full overflow-visible">
              {[14, 29.6, 45.2, 60.8, 76.4, 92].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#EDF0F5" strokeWidth="0.45" />
              ))}
              <defs>
                <filter id="chartShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#8EA2FF" floodOpacity="0.45" />
                </filter>
              </defs>
              <polyline points={points} fill="none" stroke="#8EA2FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#chartShadow)" />
              {values.map((value, index) => {
                const x = 6 + (index / (values.length - 1)) * 88;
                const y = 92 - (value / max) * 78;
                return <circle key={index} cx={x} cy={y} r="1.8" fill="#8EA2FF" stroke="white" strokeWidth="0.8" />;
              })}
              <g>
                <rect x="40" y="36" width="13" height="9" rx="2" fill="white" stroke="#EAEFFF" />
                <text x="46.5" y="42.3" textAnchor="middle" fontSize="4.1" fill="#8EA2FF" fontWeight="600">55,000</text>
              </g>
            </svg>
            <div className="grid grid-cols-12 text-center text-[15px] font-normal text-[#4F4F4F]">
              {months.map((month) => <span key={month}>{month}</span>)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
