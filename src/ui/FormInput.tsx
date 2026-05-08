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
};

export default function FormInput({
  label,
  required = false,
  value,
  placeholder,
  type = "text",
  onChange,
  className = "",
  labelClassName = "mb-[5px] block text-[12px] font-semibold leading-[15px] text-[#202224]",
  inputClassName = "h-[51px] w-full rounded-[7px] border border-[#D3D3D3] bg-white px-[10px] text-[12px] font-normal leading-[15px] text-[#202224] outline-none transition placeholder:text-[#A7A7A7] focus:border-[#FE512E]",
}: FormInputProps) {
  return (
    <div className={`h-[96px] w-full ${className}`}>
      <label className={labelClassName}>
        {label}
        {required && <span className="text-[#E74C3C]">*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </div>
  );
}