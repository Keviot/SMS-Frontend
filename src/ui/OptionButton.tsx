type OptionButtonProps = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function OptionButton({
  label,
  selected,
  disabled = false,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[41px] w-full items-center justify-center gap-[8px] rounded-[10px] border px-[8px] text-[16px] font-medium leading-[20px] transition ${
        selected
          ? "border-[#FE512E] bg-white text-[#202224]"
          : "border-[#D3D3D3] bg-white text-[#A7A7A7]"
      }`}
    >
      <span
        className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border ${
          selected ? "border-[#FE512E]" : "border-[#D3D3D3]"
        }`}
      >
        {selected && (
          <span className="h-[12px] w-[12px] rounded-full bg-[#FE512E]" />
        )}
      </span>

      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}