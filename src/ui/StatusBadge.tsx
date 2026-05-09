import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

type StatusBadgeVariant =
  | "medium"
  | "low"
  | "high"
  | "open"
  | "pending"
  | "solve"
  | "done"
  | "cash"
  | "online"
  | "owner"
  | "tenant"
  | "occupied"
  | "vacate";

type StatusBadgeProps = {
  children: string;
  variant: StatusBadgeVariant;
  icon?: LucideIcon;
};

const classes: Record<StatusBadgeVariant, string> = {
  medium: "bg-[var(--blue)] text-white",
  low: "bg-[var(--green)] text-white",
  high: "bg-[var(--red)] text-white",
  open: "bg-[var(--blue)] text-white",
  pending: "bg-[#FFC3131A] text-[#FFC313]",
  solve: "bg-[var(--green)] text-white",
  done: "bg-[#39973D1A] text-[#39973D]",
  cash: "bg-[#2022240D] text-[#202224]",
  online: "bg-[#5678E91A] text-[#5678E9]",
  owner: "bg-[var(--accent-blue)] text-[var(--blue)]",
  tenant: "bg-[#FFF1F8] text-[#EC4899]",
  occupied: "bg-[#ECFDF5] text-[#10B981]",
  vacate: "bg-[#F5F3FF] text-[#8B5CF6]",
};

export default function StatusBadge({ children, variant, icon: Icon }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[31px] min-w-[100px] items-center justify-center gap-2 rounded-full px-[15px] text-[12px] font-semibold capitalize",
        classes[variant]
      )}
    >
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}
