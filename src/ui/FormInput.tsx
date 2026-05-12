import { cn } from "../lib/cn";

type FormInputProps = {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  error?: string;
  disabled?: boolean;
};

export default function FormInput({
  label,
  required = false,
  value,
  placeholder,
  type = "text",
  onChange,
  className = "",
  labelClassName = "",
  inputClassName = "",
  error,
  disabled = false,
}: FormInputProps) {
  return (
    <div className={cn("w-full", className)}>
      <label
        className={cn(
          "mb-1 block text-xs font-semibold leading-[15px] text-[#202224]",
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-[#E74C3C]">*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-10 w-full rounded-[7px] border border-[#D3D3D3] bg-white px-2.5 text-xs font-normal leading-[15px] text-[#202224] outline-none transition placeholder:text-[#A7A7A7] focus:border-[#FE512E] disabled:cursor-not-allowed disabled:bg-[#F6F8FB] disabled:text-[#A7A7A7]",
          error && "border-[#E74C3C] focus:border-[#E74C3C]",
          inputClassName
        )}
      />

      {error && (
        <p className="mt-1 text-[11px] font-normal leading-[14px] text-[#E74C3C]">
          {error}
        </p>
      )}
    </div>
  );
}