import { ChevronDown } from "lucide-react";
import Card from "../../../ui/Card";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
    <Card className="flex min-h-[24rem] flex-col p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold leading-6 text-[#202224]">
            Total Balance
          </h2>

          <p className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.4px] text-[#202224]">
            55,000
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-4 rounded-[10px] border border-[#D3D3D3] bg-white px-4 text-sm font-semibold text-[#202224] sm:min-w-28"
          >
            Month
            <ChevronDown size={18} />
          </button>

          <div className="absolute right-0 top-full z-10 mt-2 w-full rounded-[10px] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:w-40">
            {["Last week", "Last month", "Last Year"].map((item) => {
              const isActive = item === "Last month";

              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2.5 py-1.5"
                >
                  <span
                    className={[
                      "grid size-4 place-items-center rounded-full border",
                      isActive ? "border-[#FE512E]" : "border-[#C9CDD5]",
                    ].join(" ")}
                  >
                    {isActive && (
                      <span className="size-2 rounded-full bg-[#FE512E]" />
                    )}
                  </span>

                  <span
                    className={[
                      "text-xs font-medium",
                      isActive ? "text-[#202224]" : "text-[#A7A7A7]",
                    ].join(" ")}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        <div className="grid h-full grid-cols-[2.75rem_minmax(0,1fr)]">
          <div className="flex h-full flex-col justify-between pb-8 pt-1 text-sm font-normal text-[#4F4F4F]">
            {["50k", "40k", "30k", "20k", "10k", "0k"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="min-w-0">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-64 w-full overflow-visible sm:h-72"
            >
              {[14, 29.6, 45.2, 60.8, 76.4, 92].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  stroke="#EDF0F5"
                  strokeWidth="0.45"
                />
              ))}

              <defs>
                <filter
                  id="chartShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="5"
                    stdDeviation="4"
                    floodColor="#8EA2FF"
                    floodOpacity="0.45"
                  />
                </filter>
              </defs>

              <polyline
                points={points}
                fill="none"
                stroke="#8EA2FF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#chartShadow)"
              />

              {values.map((value, index) => {
                const x = 6 + (index / (values.length - 1)) * 88;
                const y = 92 - (value / max) * 78;

                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="#8EA2FF"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                );
              })}

              <g>
                <rect
                  x="40"
                  y="36"
                  width="13"
                  height="9"
                  rx="2"
                  fill="white"
                  stroke="#EAEFFF"
                />
                <text
                  x="46.5"
                  y="42.3"
                  textAnchor="middle"
                  fontSize="4.1"
                  fill="#8EA2FF"
                  fontWeight="600"
                >
                  55,000
                </text>
              </g>
            </svg>

            <div className="mt-2 grid grid-cols-6 gap-y-2 text-center text-xs font-normal text-[#4F4F4F] sm:grid-cols-12 sm:text-sm">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}