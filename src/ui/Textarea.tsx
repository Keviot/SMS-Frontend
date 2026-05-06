import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-2 block text-xs font-bold text-[#202224]"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={cn(
          "min-h-[110px] w-full resize-none rounded-[10px] border bg-white px-3 py-3 text-sm font-semibold text-[#202224] outline-none transition-all duration-200 placeholder:text-[#A0A6B2]",
          error
            ? "border-[#EF4444]"
            : "border-[#DFE4EC] focus:border-[#FF8A00]",
          className
        )}
        {...props}
      />

      <p
        className={cn(
          "mt-1 min-h-4 text-[11px] font-semibold",
          error ? "text-[#EF4444]" : "text-transparent"
        )}
      >
        {error || "placeholder"}
      </p>
    </div>
  );
}
