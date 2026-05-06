import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)] hover:shadow-[0_12px_24px_rgba(255,107,53,0.35)] hover:scale-[1.02]",
  secondary: "bg-[var(--bg-gray)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]",
  outline:
    "border border-[var(--border)] bg-white text-[var(--text-tertiary)] hover:border-[#FFB59C] hover:bg-[var(--accent-peach)] hover:text-[var(--primary-gradient-start)]",
  ghost: "bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-gray)] hover:text-[var(--text-primary)]",
  danger: "bg-[var(--red)] text-white hover:bg-[var(--red-hover)]",
  success: "bg-[var(--green)] text-white hover:bg-[var(--green-hover)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-[10px]",
  lg: "h-11 px-5 text-sm rounded-[10px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}