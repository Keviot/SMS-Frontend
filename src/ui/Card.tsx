import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-[#EDF0F5] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
