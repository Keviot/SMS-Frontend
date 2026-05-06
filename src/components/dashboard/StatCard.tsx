import {
  Banknote,
  IndianRupee,
  TrendingDown,
} from "lucide-react";
import { BuildingIcon } from "../../icons/admin-dashboard-icons";
import Card from "../../ui/Card";

type StatCardType = "balance" | "income" | "expense" | "unit";

type StatCardProps = {
  title: string;
  value: string;
  type: StatCardType;
};

const statConfig = {
  balance: {
    icon: IndianRupee,
    className: "bg-[#FFF1E9] text-[#FF5630]",
  },
  income: {
    icon: Banknote,
    className: "bg-[#EAFBF1] text-[#16A34A]",
  },
  expense: {
    icon: TrendingDown,
    className: "bg-[#EEF5FF] text-[#3B82F6]",
  },
  unit: {
    icon: BuildingIcon,
    className: "bg-[#F3EFFF] text-[#8B5CF6]",
  },
};

export default function StatCard({ title, value, type }: StatCardProps) {
  const config = statConfig[type];
  const Icon = config.icon;
  const showCurrency = type !== "unit";

  return (
    <Card className="flex h-[90px] w-full items-start justify-between p-[15px] lg:h-[105px] lg:p-[20px]">
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[12px] font-medium text-[#A7A7A7] lg:text-[14px]">{title}</p>
        <h3 className="mt-[6px] text-[20px] font-bold leading-none tracking-tight text-[#202224] sm:text-[24px] lg:mt-[8px] lg:text-[32px]">
          {showCurrency && "₹ "}{value}
        </h3>
      </div>

      <div className={`grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[10px] lg:h-[45px] lg:w-[45px] ${config.className}`}>
        <Icon size={20} strokeWidth={2} className="lg:w-6 lg:h-6" />
      </div>
    </Card>
  );
}