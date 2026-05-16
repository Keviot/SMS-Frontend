import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: { target: { value: string, name?: string } }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
  showRadio?: boolean;
};

export default function Select({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Select",
  className,
  required = false,
  name,
  showRadio = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue, name } });
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label className="mb-1 block text-xs font-semibold leading-[15px] text-[#202224]">
          {label}
          {required && <span className="text-[#E74C3C] ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-[7px] border bg-white px-3 text-[12px] transition-all duration-200",
          error ? "border-[#E74C3C]" : isOpen ? "border-[#FF6B35]" : "border-[#D3D3D3]",
          className
        )}
      >
        <span className={cn(selectedOption ? "text-[#202224]" : "text-[#8A909B]")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full rounded-xl bg-white p-4 shadow-xl border border-[#F1F1F1] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-4">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "group flex items-center cursor-pointer",
                  showRadio ? "gap-3" : "justify-center px-1"
                )}
              >
                {showRadio && (
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                    value === option.value ? "border-[#FF6B35]" : "border-[#D9D9D9] group-hover:border-[#FF6B35]/50"
                  )}>
                    {value === option.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF6B35]" />
                    )}
                  </div>
                )}
                <span className={cn(
                  "text-sm font-semibold transition-colors duration-200",
                  value === option.value ? "text-[#202224]" : "text-[#8A909B] group-hover:text-[#202224]"
                )}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-[6px] text-[12px] font-medium text-[#E74C3C]">
          {error}
        </p>
      )}
    </div>
  );
}
