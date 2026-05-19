import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminNavigation, residentNavigation, securityNavigation, footerNavigation, type NavItem } from "../constants/navigation";
import { cn } from "../lib/cn";
import ConfirmPopup from "../ui/ConfirmPopup";
import { authApi } from "../services/api";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { role, logout: contextLogout } = useAuth();

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleNavClick = (path: string, hasChildren: boolean, label: string) => {
    if (hasChildren) {
      toggleExpand(label);
    } else {
      navigate(path);
      if (window.innerWidth < 1024) onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
      contextLogout();
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      // Still logout locally as fallback
      contextLogout();
      navigate("/login");
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  const getNavigation = (): NavItem[] => {
    switch (role?.toLowerCase()) {
      case "resident":
        return residentNavigation;
      case "security":
      case "guard":
        return securityNavigation;
      case "admin":
      default:
        return adminNavigation;
    }
  };

  const currentNavigation = getNavigation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] flex-col border-r border-(--border-light) bg-white transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-[100px] items-center justify-between px-[30px]">
        <div className="text-[20px] font-black tracking-[-0.6px] text-(--text-primary) cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="text-(--primary)">Dash</span>Stack
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl bg-(--bg-gray-lighter) text-(--text-primary) lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-[15px] py-1">
        {currentNavigation.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.children?.length);
          const isExpanded = expanded.includes(item.label);
          const isActive = location.pathname === item.path || (hasChildren && item.children.some(child => location.pathname === child.path));

          return (
            <div key={item.label} className="mb-1 relative">
              {isActive && (
                <div className="absolute -left-[15px] top-[3px] bottom-[3px] w-[6px] rounded-r-[10px] bg-gradient-to-b from-[#FE512E] to-[#F09633]" />
              )}
              <button
                type="button"
                onClick={() => handleNavClick(item.path, hasChildren, item.label)}
                className={cn(
                  "flex h-[46px] w-full items-center justify-between rounded-[10px] px-[15px] text-[14px] font-semibold transition-all duration-200",
                  isActive
                    ? "bg-linear-to-r from-(--primary-gradient-start) to-(--primary-gradient-end) text-white shadow-[0_10px_18px_rgba(255,107,53,0.22)]"
                    : "text-(--text-light) hover:bg-(--accent-peach) hover:text-(--primary)"
                )}
              >
                <span className="flex items-center gap-[10px] text-left">
                  <Icon className="h-4.5 w-4.5 [&>path]:fill-current" />
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
                <div className="space-y-1 py-2 pl-10.5">
                  {item.children?.map((child: any) => (
                    <button
                      key={child.label}
                      type="button"
                      onClick={() => {
                        navigate(child.path);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={cn(
                        "block w-full rounded-lg px-2 py-2 text-left text-sm font-medium transition",
                        location.pathname === child.path
                          ? "text-(--primary) bg-(--accent-peach)"
                          : "text-(--text-light) hover:bg-(--accent-peach) hover:text-(--primary)"
                      )}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-(--border-light) px-[15px] py-4">
        {footerNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === "Logout") {
                  setIsLogoutModalOpen(true);
                }
              }}
              className={cn(
                "mb-1 flex h-11.5 w-full items-center gap-[10px] rounded-[10px] px-[15px] text-sm font-semibold transition hover:bg-(--bg-gray-lighter)",
                item.danger ? "text-(--red)" : "text-(--text-light)"
              )}
            >
              <Icon className="h-4.5 w-4.5 [&>path]:fill-current" />
              {item.label}
            </button>
          );
        })}
      </div>

      <ConfirmPopup
        open={isLogoutModalOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </aside>
  );
}