import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NotificationBingIcon } from "../icons/admin-dashboard-icons";
import NotificationDropdown from "../components/dashboard/NotificationDropdown";
import Button from "../ui/Button";
import Input from "../ui/Input";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[80px] items-center justify-between gap-3 border-b border-[var(--border-light)] bg-white px-[15px] sm:px-[20px] lg:h-[100px] lg:px-[25px]">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Button
          variant="outline"
          size="md"
          onClick={onMenuClick}
          className="h-[45px] w-[45px] flex-shrink-0 rounded-xl p-0 lg:hidden"
        >
          <Menu size={21} />
        </Button>

        {/* Desktop: Full search bar */}
        <div className="hidden sm:block w-full max-w-[400px]">
          <Input
            type="text"
            placeholder="Search Here"
            leftIcon={<Search size={18} strokeWidth={2} />}
            className="h-[45px] rounded-full border-[var(--border)] lg:h-[50px]"
          />
        </div>

        {/* Mobile: Search icon button */}
        <Button
          variant="outline"
          size="md"
          onClick={() => setSearchOpen(!searchOpen)}
          className="h-[45px] w-[45px] flex-shrink-0 rounded-full p-0 sm:hidden"
        >
          <Search size={20} strokeWidth={2} />
        </Button>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen((value) => !value)}
            className="relative grid h-[45px] w-[45px] place-items-center rounded-[10px] border border-[#D8D8D8] bg-white transition hover:border-[#FE512E]/50"
            aria-label="Open notifications"
          >
            <NotificationBingIcon className="h-[22px] w-[22px]" />
            <span className="absolute right-[12px] top-[11px] h-[8px] w-[8px] rounded-full bg-[#E74C3C] ring-2 ring-white" />
          </button>
          {notificationOpen && <NotificationDropdown />}
        </div>

        <Link to="/profile">
          <Button
            variant="ghost"
            size="md"
            className="h-[45px] gap-2 rounded-xl p-0 hover:bg-transparent lg:h-[50px] lg:gap-3"
          >
            <div className="grid h-[45px] w-[45px] flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)] text-[13px] font-black text-white lg:h-[50px] lg:w-[50px] lg:text-[14px]">
              MR
            </div>

            <div className="hidden text-left sm:block">
              <h4 className="text-[13px] font-bold leading-tight text-[var(--text-primary)] lg:text-[14px]">
                Moni Roy
              </h4>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--text-light)] lg:text-[12px]">Admin</p>
            </div>

            <ChevronDown size={16} className="hidden text-[var(--text-light)] sm:block lg:w-[18px] lg:h-[18px]" strokeWidth={2} />
          </Button>
        </Link>
      </div>

      {/* Mobile search overlay */}
     {/* Mobile search overlay */}
{searchOpen && (
  <div className="fixed inset-0 z-40 sm:hidden">
    {/* Backdrop */}
    <button
      type="button"
      aria-label="Close search"
      className="absolute inset-0 bg-black/20"
      onClick={() => setSearchOpen(false)}
    />

    {/* Search bar */}
    <div
      className="absolute inset-x-0 top-[80px] z-50 bg-white p-4 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        type="text"
        placeholder="Search Here"
        autoFocus
        leftIcon={<Search size={18} strokeWidth={2} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="flex-shrink-0"
          >
            <X size={18} strokeWidth={2} />
          </button>
        }
        className="h-[45px] rounded-full border-[var(--border)]"
      />
    </div>
  </div>
)}
    </header>
  );
}
