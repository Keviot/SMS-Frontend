
import { BalanceIcon, BuildingIcon, MoneyRecieveIcon, MoneySendIcon, TotalUnitIcon } from "../../icons/admin-dashboard-icons";
import Card from "../../ui/Card";

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
    border: "border-t-[#FE512E] border-r-[#FE512E]",
  },
  income: {
    icon: MoneyRecieveIcon,
    iconBg: "bg-[#EAFBF1]",
    iconColor: "text-[#39973D]",
    edge: "bg-[#95D4A0]",
    border: "border-t-[#39973D] border-r-[#39973D]",
  },
  expense: {
    icon: MoneySendIcon,
    iconBg: "bg-[#EEF4FF]",
    iconColor: "text-[#5678E9]",
    edge: "bg-[#AFC2FF]",
    border: "border-t-[#5678E9] border-r-[#5678E9]",
  },
  unit: {
    icon: TotalUnitIcon,
    iconBg: "bg-[#FFF0FB]",
    iconColor: "text-[#EC4899]",
    edge: "bg-[#F99DE3]",
    border: "border-t-[#EC4899] border-r-[#EC4899]",
  },
};

export default function StatCard({ title, value, type }: StatCardProps) {
  const config = statConfig[type];
  const Icon = config.icon;

  return (
    <Card className={`relative flex h-[105px] items-center justify-between overflow-hidden border-t border-r p-[30px] ${config.border}`}>
      <span className={`absolute left-0 top-[25px] h-[50px] w-[6px] rounded-r-full ${config.edge}`} />
      <div className="min-w-0 pr-[12px]">
        <p className="text-[16px] font-medium leading-[20px] text-[#202224]">{title}</p>
        <h3 className="mt-[8px] text-[26px] font-semibold leading-[31px] tracking-[-0.4px] text-[#202224]">
          {type !== "unit" && "₹ "}{value}
        </h3>
      </div>
      <div className={`grid h-[45px] w-[45px] shrink-0 place-items-center rounded-[10px] ${config.iconBg} ${config.iconColor}`}>
        <Icon className="h-[24px] w-[24px] [&_path]:fill-current" strokeWidth={2.2} />
      </div>
    </Card>
  );
}
