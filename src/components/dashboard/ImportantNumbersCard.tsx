import { Plus } from "lucide-react";
import { EditIcon, TrashIcon } from "../../icons/admin-dashboard-icons";
import Card from "../ui/Card";

type ImportantNumber = {
  id: string;
  name: string;
  phone: string;
  work: string;
};

type ImportantNumbersCardProps = {
  data: ImportantNumber[];
};

type ActionButtonProps = {
  label: string;
  children: React.ReactNode;
  iconColor: string;
};

function ActionButton({ label, children, iconColor }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#F6F8FB] transition hover:opacity-80"
      style={{
        color: iconColor,
      }}
    >
      <span className="flex h-[14px] w-[14px] items-center justify-center [&_svg]:h-[14px] [&_svg]:w-[14px] [&_svg]:text-current [&_svg_path]:stroke-current">
        {children}
      </span>
    </button>
  );
}

export default function ImportantNumbersCard({
  data,
}: ImportantNumbersCardProps) {
  return (
    <Card className="h-[350px] w-full rounded-[16px] border border-[#EDF0F5] bg-white p-[15px] shadow-[0px_8px_24px_rgba(15,23,42,0.05)] lg:h-[398px] lg:p-[16px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-[10px]">
        <h2 className="text-[14px] font-semibold leading-none text-[#202224] sm:text-[16px]">
          Important Numbers
        </h2>

        <button
          type="button"
          className="flex h-[30px] items-center gap-[5px] rounded-[5px] bg-[linear-gradient(90deg,#FE512E_0%,#F09619_100%)] px-[8px] text-[12px] font-medium leading-none text-white shadow-[0px_6px_14px_rgba(254,81,46,0.22)] transition hover:opacity-90"
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.2} />
          Add
        </button>
      </div>

      {/* List */}
      <div className="mt-[12px] h-[269px] space-y-[12px] overflow-y-auto pr-[5px] lg:h-[305px]">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex min-h-[75px] justify-between gap-[10px] rounded-[10px] border border-[#F4F4F4] bg-white p-[12px] shadow-[0px_2px_8px_rgba(15,23,42,0.03)]"
          >
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[12px] font-medium leading-[17px] text-[#202224]">
                <span className="font-semibold">Name :</span>{" "}
                <span className="text-[#4F4F4F]">{item.name}</span>
              </h4>

              <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                Ph Number :{" "}
                <span className="text-[#4F4F4F]">{item.phone}</span>
              </p>

              <p className="mt-[5px] truncate text-[11px] font-medium leading-[16px] text-[#A7A7A7]">
                Work : <span className="text-[#4F4F4F]">{item.work}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-row gap-1">
              <ActionButton label="Delete important number" iconColor="white">
                <TrashIcon />
              </ActionButton>

              <ActionButton label="Edit important number" iconColor="white">
                <EditIcon />
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}