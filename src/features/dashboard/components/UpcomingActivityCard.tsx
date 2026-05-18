import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Card from "../../../ui/Card";

type UpcomingActivity = {
  id: string;
  letter: string;
  title: string;
  time: string;
  date: string;
};

type UpcomingActivityCardProps = {
  data: UpcomingActivity[];
};

const colors = [
  "bg-[#5678E9]",
  "bg-[#39973D]",
  "bg-[#FE512E]",
  "bg-[#F09619]",
  "bg-[#5678E9]",
];

export default function UpcomingActivityCard({
  data,
}: UpcomingActivityCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <Card className="flex full flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold leading-5 text-[#202224]">
          Upcoming Activity
        </h2>

        <div className="dropdown-container relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#D3D3D3] bg-white px-3.5 text-md font-semibold text-[#202224] transition hover:bg-[#F6F8FB]"
          >
            {selectedPeriod} <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-[10px] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              {["Last Week", "Last Month", "Last Year"].map((item) => {
                const isActive = item === selectedPeriod || (item === "Last Month" && selectedPeriod === "Month");

                return (
                  <label
                    key={item}
                    onClick={() => {
                      setSelectedPeriod(item);
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

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="divide-y divide-[#F1F1F1]">
          {data.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-2"
            >
              <div
                className={[
                  "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white",
                  colors[index % colors.length],
                ].join(" ")}
              >
                {item.letter}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-5 text-[#202224]">
                  {item.title}
                </p>

                <p className="truncate text-[11px] font-medium leading-4 text-[#A7A7A7]">
                  {item.time}
                </p>
              </div>

              <p className="shrink-0 text-right text-[11px] font-medium leading-4 text-[#A7A7A7]">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}