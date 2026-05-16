import { ChevronDown } from "lucide-react";
import Card from "../../../ui/Card";
import { useState } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthDays = ["1", "5", "10", "15", "20", "25", "30"];

type BalanceChartProps = {
  data?: number[];
  total?: number | string;
};

export default function BalanceChart({ data = [], total = "0" }: BalanceChartProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Year");

  // Determine labels and data points based on selection
  const getChartConfig = () => {
    switch (selectedOption) {
      case "Week":
        return {
          labels: weekDays,
          values: data.slice(0, 7).length === 7 ? data.slice(0, 7) : [12000, 15000, 13000, 18000, 14000, 16000, 19000]
        };
      case "Month":
        return {
          labels: monthDays,
          values: data.slice(0, 7).length === 7 ? data.slice(0, 7) : [15000, 22000, 19000, 28000, 24000, 26000, 32000]
        };
      default: // Year
        return {
          labels: months,
          values: data.length === 12 ? data : [10000, 16000, 14000, 27000, 18000, 24000, 20000, 30000, 29000, 28000, 35000, 42000]
        };
    }
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { labels, values: chartValues } = getChartConfig();
  const maxVal = Math.max(...chartValues, 50000);

  const getPath = () => {
    if (chartValues.length < 2) return "";

    const pointsArray = chartValues.map((value, index) => ({
      x: 4 + (index / (chartValues.length - 1)) * 92,
      y: 92 - (value / maxVal) * 78,
    }));

    let d = `M ${pointsArray[0].x},${pointsArray[0].y}`;

    for (let i = 0; i < pointsArray.length - 1; i++) {
      const p1 = pointsArray[i];
      const p2 = pointsArray[i + 1];

      // Control points for smooth bezier curve
      const cx = (p1.x + p2.x) / 2;
      d += ` C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
    }

    return d;
  };

  return (
    <Card className="flex min-h-100 flex-col p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold leading-6 text-[#202224]">
            Total Balance
          </h2>

          <p className="mt-0 text-3xl font-semibold leading-tight tracking-[-0.4px] text-[#202224]">
            {Number(total).toLocaleString()}
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex min-h-11 w-full items-center justify-between gap-4 rounded-[10px] border border-[#D3D3D3] bg-white px-4 text-sm font-semibold text-[#202224] sm:min-w-28"
          >
            {selectedOption}
            <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-full rounded-[10px] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:w-44">
              {["Week", "Month", "Year"].map((item) => {
                const isActive = item === selectedOption;

                return (
                  <label
                    key={item}
                    onClick={() => {
                      setSelectedOption(item);
                      setIsDropdownOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <div
                      className={`grid size-4 place-items-center rounded-full border ${isActive ? "border-[#FE512E]" : "border-[#C9CDD5]"
                        }`}
                    >
                      {isActive && (
                        <div className="size-2 rounded-full bg-[#FE512E]" />
                      )}
                    </div>

                    <span
                      className={`text-xs font-medium ${isActive ? "text-[#202224]" : "text-[#A7A7A7]"
                        }`}
                    >
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-0 min-h-0 flex-1">
        <div className="grid h-full grid-cols-[3rem_minmax(0,1fr)]">
          <div className="relative h-72 text-sm font-normal text-[#4F4F4F]">
            {[
              { label: "50k", top: "14%" },
              { label: "40k", top: "29.6%" },
              { label: "30k", top: "45.2%" },
              { label: "20k", top: "60.8%" },
              { label: "10k", top: "76.4%" },
              { label: "0k", top: "92%" },
            ].map((item) => (
              <span
                key={item.label}
                className="absolute left-0 -translate-y-1/2 leading-none"
                style={{ top: item.top }}
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="relative min-w-0">
            <div className="relative">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-72 w-full overflow-visible"
              >
                {[14, 29.6, 45.2, 60.8, 76.4, 92].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="100"
                    y1={y}
                    y2={y}
                    stroke="#F1F1F1"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                <defs>
                  <filter id="chartShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="3"
                      floodColor="#8EA2FF"
                      floodOpacity="0.4"
                    />
                  </filter>
                </defs>

                <path
                  d={getPath()}
                  fill="none"
                  stroke="#8EA2FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#chartShadow)"
                />

                {/* Dynamic Tooltip placeholder - can be improved for interactivity */}
                {selectedOption === "Last Year" && (
                  <g>
                    <filter id="tooltipShadow">
                      {/* <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" /> */}
                    </filter>
                    <rect
                      x="43"
                      y="44"
                      width="14"
                      height="8"
                      rx="3"
                      fill="white"
                      stroke="#F1F1F1"
                      strokeWidth="0.5"
                      filter="url(#tooltipShadow)"
                    />
                  </g>
                )}
              </svg>

              {/* Perfectly round points rendered as HTML */}
              <div className="absolute inset-0">
                {chartValues.map((value, index) => {
                  const x = 4 + (index / (chartValues.length - 1)) * 92;
                  const y = 92 - (value / maxVal) * 78;

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="absolute size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-1.5px border-white bg-[#8EA2FF] shadow-[0_2px_4px_rgba(142,162,255,0.4)] cursor-pointer transition-transform hover:scale-150 z-10"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {hoveredIndex === index && (
                        <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg  px-3 py-1.5 text-[11px] font-bold text-[#8EA2FF] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                          {value.toLocaleString()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative mt-4 h-6 text-xs font-normal text-[#4F4F4F] sm:text-sm">
              {labels.map((label, index) => {
                const x = 4 + (index / (labels.length - 1)) * 92;
                return (
                  <span
                    key={index}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${x}%` }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}