import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface FormDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  popupAlign?: "left" | "center" | "right";
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDisplayDate(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatValueDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value: string) {
  if (!value) return null;

  if (value.includes("-")) {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  return null;
}

export default function FormDatePicker({
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  className = "",
  disabled = false,
}: FormDatePickerProps) {
  const selectedDate = parseDate(value);
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(selectedDate || today);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstWeekDay = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const previousMonthLastDate = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      label: number;
      currentMonth: boolean;
    }[] = [];

    for (let i = firstWeekDay - 1; i >= 0; i--) {
      const day = previousMonthLastDate - i;
      days.push({
        date: new Date(year, month - 1, day),
        label: day,
        currentMonth: false,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: new Date(year, month, day),
        label: day,
        currentMonth: true,
      });
    }

    while (days.length % 7 !== 0 || days.length < 42) {
      const nextDay = days.length - (firstWeekDay + totalDays) + 1;
      days.push({
        date: new Date(year, month + 1, nextDay),
        label: nextDay,
        currentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToPreviousMonth = () => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    );
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-3 text-left text-sm font-medium text-[var(--text-primary)] outline-none transition-all hover:border-[#202224] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={
            selectedDate
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-light)]"
          }
        >
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>

        <Calendar size={20} className="text-[var(--text-primary)]" />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+0.25rem)] z-[80] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-white p-3 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:left-0 sm:w-80 sm:translate-x-0 sm:p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-[var(--text-primary)]">
                {MONTHS[viewDate.getMonth()]}
              </span>
              <span className="text-2xl font-semibold leading-none text-[var(--text-primary)] sm:text-3xl">
                {viewDate.getFullYear()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="flex size-8 items-center justify-center rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={goToNextMonth}
                className="flex size-8 items-center justify-center rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-3 text-center">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-[var(--text-primary)]"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((dayItem) => {
              const isSelected =
                selectedDate &&
                dayItem.date.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={dayItem.date.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(formatValueDate(dayItem.date));
                    setOpen(false);
                  }}
                  className={`mx-auto flex size-7 items-center justify-center rounded-full text-xs font-medium transition-all sm:size-8 sm:text-sm ${isSelected
                    ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                    : dayItem.currentMonth
                      ? "text-[var(--text-primary)] hover:bg-[var(--accent-peach)]"
                      : "text-[var(--text-light)] hover:bg-[var(--bg-gray-light)]"
                    }`}
                >
                  {dayItem.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}