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
};

const classes: Record<StatusBadgeVariant, string> = {
  medium: "bg-[var(--blue)] text-white",
  low: "bg-[var(--green)] text-white",
  high: "bg-[var(--red)] text-white",
  open: "bg-[var(--blue)] text-white",
  pending: "bg-[var(--yellow)] text-white",
  solve: "bg-[var(--green)] text-white",
  done: "bg-[var(--green)] text-white",
  cash: "bg-[#F1F5F9] text-[var(--text-dark)]",
  online: "bg-[var(--blue)] text-white",
  owner: "bg-[var(--accent-orange)] text-[var(--primary-gradient-start)]",
  tenant: "bg-[var(--accent-blue)] text-[#2563EB]",
  occupied: "bg-[var(--green)] text-white",
  vacate: "bg-[var(--red)] text-white",
};

export default function StatusBadge({ children, variant }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[31px] min-w-[90px] items-center justify-center rounded-full px-[15px] text-[12px] font-semibold",
        classes[variant]
      )}
    >
      {children}
    </span>
  );
}
