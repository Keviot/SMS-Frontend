type FormTextareaProps = {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function FormTextarea({
  label,
  required = false,
  value,
  placeholder,
  onChange,
  className = "",
}: FormTextareaProps) {
  return (
    <div className={`h-[96px] w-full ${className}`}>
      <label className="mb-[5px] block text-[16px] font-medium leading-[20px] text-[#202224]">
        {label}
        {required && <span className="text-[#E74C3C]">*</span>}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[60px] w-full resize-none overflow-hidden rounded-[10px] border border-[#202224] bg-white px-[13px] py-[8px] text-[16px] font-normal leading-[20px] text-[#202224] outline-none placeholder:text-[#A7A7A7]"
      />
    </div>
  );
}