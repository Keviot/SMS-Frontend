import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Card from "../ui/Card";

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

// Sample data points for line chart (0-100 scale)
const dataPoints = [30, 45, 35, 50, 40, 60, 45, 65, 50, 70, 55, 75];

export default function BalanceChart() {
  const [period, setPeriod] = useState("Last Year");

  // Calculate SVG path for line chart
  const width = 100;
  const height = 100;
  const padding = 5;
  
  const points = dataPoints.map((value, index) => {
    const x = (index / (dataPoints.length - 1)) * (width - padding * 2) + padding;
    const y = height - (value / 100) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className="h-[350px] w-full p-[15px] lg:h-[398px] lg:p-[20px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] sm:text-[16px] lg:text-[18px]">Total Balance</h2>
          <p className="mt-[8px] text-[22px] font-bold leading-none text-[var(--text-primary)] sm:text-[26px] lg:mt-[10px] lg:text-[34px]">
            ₹ 55,000
          </p>
        </div>

        <div className="relative flex-shrink-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-[36px] appearance-none rounded-[10px] border border-[var(--border)] bg-white pl-[12px] pr-[32px] text-[13px] font-medium text-[var(--text-tertiary)] outline-none transition-colors hover:border-[#FFD5C7] focus:border-[#FF8A00] lg:h-[40px] lg:pl-[15px] lg:pr-[35px] lg:text-[14px]"
          >
            <option value="Last week">Last week</option>
            <option value="Last month">Last month</option>
            <option value="Last Year">Last Year</option>
          </select>
          <ChevronDown 
            size={14} 
            strokeWidth={2}
            className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] lg:right-[12px] lg:w-4 lg:h-4" 
          />
        </div>
      </div>

      {/* Line Chart */}
      <div className="mt-[15px] lg:mt-[20px]">
        <div className="relative h-[200px] lg:h-[240px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-[11px] font-medium text-[var(--text-light)] lg:text-[12px]">
            <span>50k</span>
            <span>40k</span>
            <span>30k</span>
            <span>20k</span>
            <span>10k</span>
            <span>0k</span>
          </div>

          {/* Chart area */}
          <div className="ml-[35px] h-full lg:ml-[40px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 20, 40, 60, 80, 100].map((y) => (
                <line
                  key={y}
                  x1={padding}
                  y1={height - y}
                  x2={width - padding}
                  y2={height - y}
                  stroke="#F3F4F6"
                  strokeWidth="0.5"
                />
              ))}

              {/* Gradient fill under line */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFE8D9" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFE8D9" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Fill area under line */}
              <polygon
                points={`${padding},${height} ${points} ${width - padding},${height}`}
                fill="url(#lineGradient)"
              />

              {/* Line */}
              <polyline
                points={points}
                fill="none"
                stroke="var(--primary-light)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {dataPoints.map((value, index) => {
                const x = (index / (dataPoints.length - 1)) * (width - padding * 2) + padding;
                const y = height - (value / 100) * (height - padding * 2) - padding;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="var(--primary-light)"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-[35px] mt-[8px] grid grid-cols-12 gap-1 lg:ml-[40px] lg:mt-[10px]">
          {months.map((month) => (
            <span
              key={month}
              className="text-center text-[11px] font-medium text-[var(--text-light)] lg:text-[12px]"
            >
              {month}
            </span>
          ))}
        </div>

        <p className="mt-[6px] text-center text-[11px] font-semibold text-[var(--text-light)] lg:mt-[8px] lg:text-[12px]">
          Month
        </p>
      </div>
    </Card>
  );
}