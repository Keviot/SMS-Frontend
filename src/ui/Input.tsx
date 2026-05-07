import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputClassName?: string;
};

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  inputClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-[8px] block text-[13px] font-semibold text-[#202224]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex h-[45px] items-center gap-[10px] rounded-[10px] border border-[#D3D3D3] bg-white px-[13px] transition focus-within:border-[#FE512E]",
          error && "border-[#E74C3C]",
          className
        )}
      >
        {leftIcon && <span className="grid shrink-0 place-items-center text-[#A7A7A7]">{leftIcon}</span>}
        <input
          id={inputId}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#202224] outline-none placeholder:text-[#A7A7A7]",
            inputClassName
          )}
          {...props}
        />
        {rightIcon && <span className="grid shrink-0 place-items-center text-[#A7A7A7]">{rightIcon}</span>}
      </div>
      {error && <p className="mt-[6px] text-[12px] font-medium text-[#E74C3C]">{error}</p>}
    </div>
  );
}
