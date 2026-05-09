import type { SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
};

export default function Select({
  label,
  error,
  options,
  placeholder = "Select",
  className,
  id,
  required = false,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 block text-xs font-semibold leading-[15px] text-[#202224]"
        >
          {label}
          {required && <span className="text-[#E74C3C] ml-0.5">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          "h-10 w-full appearance-none rounded-[7px] border bg-white px-[15px] text-[12px] font-normal text-[#202224] outline-none transition-all duration-200",
          "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23202224%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[position:calc(100%-15px)_50%] bg-no-repeat",
          error
            ? "border-[#E74C3C]"
            : "border-[#D3D3D3] focus:border-[#FE512E]",
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
