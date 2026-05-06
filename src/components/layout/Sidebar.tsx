import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { adminNavigation, footerNavigation } from "../../constants/navigation";
import { cn } from "../../lib/cn";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [expanded, setExpanded] = useState<string[]>([]);  // Empty array - all collapsed initially

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] flex-col border-r border-[var(--border-light)] bg-white transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-[100px] items-center justify-between px-[30px]">
        <div className="text-[20px] font-black tracking-[-0.6px] text-[var(--text-primary)]">
          <span className="text-[var(--primary)]">Dash</span>Stack
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-gray-lighter)] text-[var(--text-primary)] lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-[15px] py-1">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children?.length);
          const isExpanded = expanded.includes(item.label);

          return (
            <div key={item.label} className="mb-1">
              <button
                type="button"
                onClick={() => hasChildren && toggleExpand(item.label)}
                className={cn(
                  "flex h-[46px] w-full items-center justify-between rounded-[10px] px-[15px] text-[14px] font-semibold transition-all duration-200",
                  item.active
                    ? "bg-gradient-to-r from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)]"
                    : "text-[var(--text-light)] hover:bg-[var(--accent-peach)] hover:text-[var(--primary)]"
                )}
              >
                <span className="flex items-center gap-[10px] text-left">
                  <Icon className="h-[18px] w-[18px] [&>path]:fill-current" />
                  <span>{item.label}</span>
                </span>

                {hasChildren && (
                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className={cn(
                      "transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              {hasChildren && isExpanded && (
                <div className="space-y-1 py-2 pl-[43px]">
                  {item.children?.map((child) => (
                    <button
                      key={child}
                      type="button"
                      className="block w-full rounded-lg px-2 py-2 text-left text-[13px] font-medium text-[var(--text-light)] transition hover:bg-[var(--accent-peach)] hover:text-[var(--primary)]"
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-light)] px-[15px] py-4">
        {footerNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={cn(
                "mb-1 flex h-[46px] w-full items-center gap-[10px] rounded-[10px] px-[15px] text-[14px] font-semibold transition hover:bg-[var(--bg-gray-lighter)]",
                item.danger ? "text-[var(--red)]" : "text-[var(--text-light)]"
              )}
            >
              <Icon className="h-[18px] w-[18px] [&>path]:fill-current" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}