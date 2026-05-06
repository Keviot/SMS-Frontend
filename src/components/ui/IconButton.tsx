import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type IconButtonVariant = "view" | "edit" | "delete" | "default";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  variant?: IconButtonVariant;
};

const classes: Record<IconButtonVariant, string> = {
  view: "bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)]",
  edit: "bg-[var(--green)] text-white hover:bg-[var(--green-hover)]",
  delete: "bg-[var(--red)] text-white hover:bg-[var(--red-hover)]",
  default: "bg-[var(--bg-gray-lighter)] text-[var(--text-muted)] hover:bg-[#EEF0F5]",
};

export default function IconButton({
  icon,
  variant = "default",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "grid h-[35px] w-[35px] place-items-center rounded-[8px] transition-all duration-200 [&>svg]:h-5 [&>svg]:w-5",
        classes[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
