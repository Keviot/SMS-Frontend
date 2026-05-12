import {
  BalanceIcon,
  MoneyRecieveIcon,
  MoneySendIcon,
  TotalUnitIcon,
} from "../../../assets/icons/admin-dashboard-icons";

import Card from "../../../ui/Card";

type StatCardType = "balance" | "income" | "expense" | "unit";

type StatCardProps = {
  title: string;
  value: string;
  type: StatCardType;
};

const statConfig = {
  balance: {
    icon: BalanceIcon,
    iconBg: "bg-[#FFF1E9]",
    iconColor: "text-[#FE512E]",
    edge: "bg-[#FFB37C]",
    corner: "border-[#FE512E]",
  },
  income: {
    icon: MoneyRecieveIcon,
    iconBg: "bg-[#EAFBF1]",
    iconColor: "text-[#39973D]",
    edge: "bg-[#95D4A0]",
    corner: "border-[#39973D]",
  },
  expense: {
    icon: MoneySendIcon,
    iconBg: "bg-[#EEF4FF]",
    iconColor: "text-[#5678E9]",
    edge: "bg-[#AFC2FF]",
    corner: "border-[#5678E9]",
  },
  unit: {
    icon: TotalUnitIcon,
    iconBg: "bg-[#FFF0FB]",
    iconColor: "text-[#EC4899]",
    edge: "bg-[#F99DE3]",
    corner: "border-[#EC4899]",
  },
};

export default function StatCard({ title, value, type }: StatCardProps) {
  const config = statConfig[type];
  const Icon = config.icon;

  return (
    <Card className="relative flex min-h-[6.5rem] items-center justify-between overflow-hidden rounded-[15px] border border-[#F4F4F4] bg-white p-5 shadow-none sm:p-6">
      <span
        className={[
          "absolute left-0 top-1/2 h-1/2 w-1.5 -translate-y-1/2 rounded-r-full",
          config.edge,
        ].join(" ")}
      />

      <span
        className={[
          "pointer-events-none absolute right-0 top-0 z-[1] h-full w-1/3 rounded-tr-[15px] border-r border-t",
          config.corner,
        ].join(" ")}
      />

      <div className="min-w-0 pr-3">
        <p className="truncate text-base font-medium leading-5 text-[#202224]">
          {title}
        </p>

        <h3 className="mt-2 truncate text-2xl font-semibold leading-tight tracking-[-0.4px] text-[#202224]">
          {type !== "unit" && "₹ "}
          {value}
        </h3>
      </div>

      <div
        className={[
          "z-[2] grid size-11 shrink-0 place-items-center rounded-[10px]",
          config.iconBg,
          config.iconColor,
        ].join(" ")}
      >
        <Icon className="size-6 [&_path]:fill-current" strokeWidth={2.2} />
      </div>
    </Card>
  );
}