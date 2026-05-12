import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface FormTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

export default function FormTimePicker({
    value,
    onChange,
    placeholder = "Select Time",
    className = "",
    disabled = false,
}: FormTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState<number>(12);
    const [selectedMinute, setSelectedMinute] = useState<number>(0);
    const [period, setPeriod] = useState<"AM" | "PM">("PM");

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const hourScrollRef = useRef<HTMLDivElement | null>(null);
    const minuteScrollRef = useRef<HTMLDivElement | null>(null);

    // Parse existing value
    useEffect(() => {
        if (value) {
            const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
                setSelectedHour(parseInt(match[1]));
                setSelectedMinute(parseInt(match[2]));
                setPeriod(match[3].toUpperCase() as "AM" | "PM");
            }
        }
    }, [value]);

    // Close on click outside
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

    // Scroll to selected values when opening
    useEffect(() => {
        if (open && hourScrollRef.current && minuteScrollRef.current) {
            const hourIndex = selectedHour - 1;
            const minuteIndex = selectedMinute / 5;

            setTimeout(() => {
                if (hourScrollRef.current) {
                    hourScrollRef.current.scrollTop = hourIndex * 40;
                }
                if (minuteScrollRef.current) {
                    minuteScrollRef.current.scrollTop = minuteIndex * 40;
                }
            }, 0);
        }
    }, [open]);

    const handleConfirm = () => {
        const formattedTime = `${selectedHour}:${pad(selectedMinute)} ${period}`;
        onChange(formattedTime);
        setOpen(false);
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const displayValue = value || placeholder;

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
                        value
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-light)]"
                    }
                >
                    {displayValue}
                </span>

                <Clock size={20} className="text-[var(--text-primary)]" />
            </button>

            {open && (
                <div className="absolute left-1/2 top-[calc(100%+0.25rem)] z-[80] w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:left-0 sm:w-72 sm:translate-x-0">
                    <div className="mb-3 text-center text-base font-semibold text-[var(--text-primary)]">
                        Select Time
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-2">
                        {/* Hours */}
                        <div
                            ref={hourScrollRef}
                            className="h-40 w-16 overflow-y-auto rounded-lg border border-[#E5E7EB] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300"
                        >
                            {hours.map((hour) => (
                                <button
                                    key={hour}
                                    type="button"
                                    onClick={() => setSelectedHour(hour)}
                                    className={`flex h-10 w-full items-center justify-center text-sm font-medium transition-colors ${selectedHour === hour
                                            ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                                            : "text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
                                        }`}
                                >
                                    {pad(hour)}
                                </button>
                            ))}
                        </div>

                        <span className="text-2xl font-bold text-[var(--text-primary)]">:</span>

                        {/* Minutes */}
                        <div
                            ref={minuteScrollRef}
                            className="h-40 w-16 overflow-y-auto rounded-lg border border-[#E5E7EB] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300"
                        >
                            {minutes.map((minute) => (
                                <button
                                    key={minute}
                                    type="button"
                                    onClick={() => setSelectedMinute(minute)}
                                    className={`flex h-10 w-full items-center justify-center text-sm font-medium transition-colors ${selectedMinute === minute
                                            ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                                            : "text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
                                        }`}
                                >
                                    {pad(minute)}
                                </button>
                            ))}
                        </div>

                        {/* AM/PM */}
                        <div className="flex h-40 w-16 flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => setPeriod("AM")}
                                className={`flex flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${period === "AM"
                                        ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                                        : "border border-[#E5E7EB] text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
                                    }`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => setPeriod("PM")}
                                className={`flex flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${period === "PM"
                                        ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                                        : "border border-[#E5E7EB] text-[var(--text-primary)] hover:bg-[var(--bg-gray-light)]"
                                    }`}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="h-10 w-full rounded-lg bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)] transition hover:shadow-[0_12px_24px_rgba(255,107,53,0.28)]"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}
