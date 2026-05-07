import { Plus } from "lucide-react";
import { AddSquareIcon, EditIcon, TrashIcon } from "../../icons/admin-dashboard-icons";
import Card from "../../ui/Card";

type ImportantNumber = { id: string; name: string; phone: string; work: string };
type ImportantNumbersCardProps = { data: ImportantNumber[] };

function ActionButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-[30px] w-[30px] place-items-center rounded-[6px] bg-[#F6F8FB] transition hover:bg-[#EEF4FF] [&_svg]:h-[17px] [&_svg]:w-[17px]"
    >
      {children}
    </button>
  );
}

export default function ImportantNumbersCard({ data }: ImportantNumbersCardProps) {
  return (
    <Card className="h-[398px] p-[16px]">
      <div className="flex items-center justify-between gap-[10px]">
        <h2 className="text-[16px] font-semibold leading-[20px] text-[#202224]">Important Numbers</h2>
        <button
          type="button"
          className="flex h-[43px] w-[84px] items-center gap-[8px] rounded-[5px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-[9px] text-[12px] font-medium text-white"
        >
          <AddSquareIcon className="w-[20px] h-[20px]"/> Add
        </button>
      </div>

      <div className="mt-[15px] h-[320px] space-y-[11px] overflow-y-auto pr-[4px]">
        {data.map((item) => (
          <div key={item.id} className="flex min-h-[75px] justify-between gap-[10px] rounded-[10px] border border-[#F1F1F1] bg-white p-[10px]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium leading-[18px] text-[#202224]">
                <span className="font-semibold">Name :</span> <span className="text-[#4F4F4F]">{item.name}</span>
              </p>
              <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                Ph Number : <span className="text-[#4F4F4F]">{item.phone}</span>
              </p>
              <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                Work : <span className="text-[#4F4F4F]">{item.work}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-[6px]">
              <ActionButton label="Delete important number"><TrashIcon /></ActionButton>
              <ActionButton label="Edit important number"><EditIcon /></ActionButton>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
