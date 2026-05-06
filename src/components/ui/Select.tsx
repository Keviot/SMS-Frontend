import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export default function Select({
  label,
  error,
  options,
  placeholder = "Select",
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-[8px] block text-[13px] font-semibold text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          "h-[45px] w-full appearance-none rounded-[10px] border bg-white px-[15px] text-[14px] font-medium text-[var(--text-primary)] outline-none transition-all duration-200",
          "bg-[linear-gradient(45deg,transparent_50%,var(--text-muted)_50%),linear-gradient(135deg,var(--text-muted)_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-18px)_50%,calc(100%-13px)_50%] bg-no-repeat",
          "hover:border-[var(--primary-light)]",
          error
            ? "border-[var(--red)]"
            : "border-[var(--border)] focus:border-[var(--primary)]",
          className
        )}
        {...props}
      >
        <option value="" className="text-[var(--text-light)]">{placeholder}</option>

        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="text-[var(--text-primary)] bg-white py-[8px]"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-[6px] text-[12px] font-medium text-[var(--red)]">
          {error}
        </p>
      )}
    </div>
  );
}
