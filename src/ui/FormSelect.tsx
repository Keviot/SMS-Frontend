import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function FormSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  disabled = false,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

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
            selectedOption
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-light)]"
          }
        >
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={20}
          className={`shrink-0 text-[var(--text-primary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.25rem)] z-[70] max-h-64 w-full overflow-y-auto rounded-xl border border-[#D9D9D9] bg-white py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white"
                    : "text-[var(--text-primary)] hover:bg-[var(--accent-peach)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}