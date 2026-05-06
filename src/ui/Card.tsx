import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[15px] border border-[var(--border-light)] bg-white shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
