import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-[8px] block text-[13px] font-semibold text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-[10px] border bg-white px-3 transition-all duration-200",
          error
            ? "border-[var(--red)]"
            : "border-[var(--border)] focus-within:border-[var(--primary)]",
          className
        )}
      >
        {leftIcon && <span className="text-[var(--text-light)]">{leftIcon}</span>}

        <input
          id={inputId}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-light)]"
          {...props}
        />

        {rightIcon && <span className="text-[var(--text-light)]">{rightIcon}</span>}
      </div>

      {error && (
        <p className="mt-[6px] text-[12px] font-medium text-[var(--red)]">
          {error}
        </p>
      )}
    </div>
  );
}
