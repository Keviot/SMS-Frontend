import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../services/api";
import { NotificationBingIcon } from "../assets/icons/admin-dashboard-icons";
import NotificationDropdown from "../components/NotificationDropdown";
import { useSocket } from "../context/SocketContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Avatar from "../components/Avatar";
import { adminNavigation, residentNavigation, securityNavigation, type NavItem } from "../constants/navigation";

import { useAuth } from "../context/AuthContext";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const { user: profile } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  const getNavigation = (): NavItem[] => {
    switch (profile?.role?.toLowerCase()) {
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

  const getSearchableItems = () => {
    const navItems = getNavigation();
    const flatList: { label: string; path: string; parentLabel?: string }[] = [];

    navItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          flatList.push({
            label: child.label,
            path: child.path,
            parentLabel: item.label,
          });
        });
      } else {
        flatList.push({
          label: item.label,
          path: item.path,
        });
      }
    });
    return flatList;
  };

  const searchableItems = getSearchableItems();
  const filteredSearchItems = searchQuery.trim()
    ? searchableItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.parentLabel && item.parentLabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchResultsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Simple breadcrumb logic based on path
  const pathParts = location.pathname.split("/").filter(Boolean);
  // const currentPage = pathParts[pathParts.length - 1]
  //   ?.split("-")
  //   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //   .join(" ") || "Dashboard";

  // const userInitials = profile
  //   ? `${profile.firstname?.[0] || ""}${profile.lastname?.[0] || ""}`.toUpperCase()
  //   : "FL";
  const userName = profile
    ? `${profile.firstname || ""} ${profile.lastname && profile.lastname !== "-" ? profile.lastname : ""}`.trim()
    : "First Lastname";
  const profileImageUrl = profile?.profileImage
    ? profile.profileImage.startsWith("http")
      ? profile.profileImage
      : `${BASE_URL}/${profile.profileImage}`
    : null;
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!notificationOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [notificationOpen]);

  const { notifications } = useSocket();
  const hasUnread = notifications.some((n) => n.status === "unread");

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-(--border-light) bg-white px-[15px] sm:px-5 lg:left-70 lg:h-25 lg:px-6">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#F6F8FB] text-[#202224] lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Desktop Search Bar - Works universally across overall panel */}
          <div ref={searchContainerRef} className="hidden sm:block w-full max-w-80 lg:max-w-100 relative">
            <Input
              type="text"
              placeholder="Search Here"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResultsOpen(true);
              }}
              onFocus={() => setSearchResultsOpen(true)}
              leftIcon={<Search size={18} strokeWidth={2} />}
              className="h-11 rounded-full border-border-light lg:h-12.5"
            />
            
            {/* Search Results Dropdown */}
            {searchResultsOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {filteredSearchItems.length > 0 ? (
                  filteredSearchItems.map((item) => (
                    <button
                      key={item.path + '-' + item.label}
                      onClick={() => {
                        navigate(item.path);
                        setSearchQuery("");
                        setSearchResultsOpen(false);
                      }}
                      className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl hover:bg-[#F6F8FB] transition-colors text-sm"
                    >
                      <span className="font-semibold text-gray-800">{item.label}</span>
                      {item.parentLabel && (
                        <span className="text-xs text-gray-400 font-medium capitalize">{item.parentLabel}</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium">
                    No results matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Breadcrumbs - Only shown on other pages next to the search bar */}
          {!isDashboard && (
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium shrink-0 ml-2">
              <Link
                to="/dashboard"
                className="text-[#A7A7A7] hover:text-primary transition-colors"
              >
                Home
              </Link>
              {pathParts.map((part, index) => {
                const path = `/${pathParts.slice(0, index + 1).join("/")}`;
                const isLast = index === pathParts.length - 1;

                // Skip IDs in breadcrumbs (24-char hex)
                if (/^[0-9a-fA-F]{24}$/.test(part)) return null;

                // Map segments to friendly names
                const nameMap: Record<string, string> = {
                  "resident-management": "Resident Management",
                  "add": "Owner Form",
                  "financial-management": "Financial Management",
                  "facility-management": "Facility Management",
                  "complaint-tracking": "Service And Complaint",
                  "security-management": "Security Management",
                  "security-guard": "Security Guard",
                  "announcement": "Announcement",
                  "profile": "Profile",
                  "income": "Income",
                  "expense": "Expense",
                  "note": "Note"
                };

                const friendlyName = nameMap[part] || part
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                return (
                  <div key={path} className="flex items-center gap-2">
                    <span className="text-[#202224] font-bold">{">"}</span>
                    {isLast ? (
                      <span className="text-secondary font-semibold">
                        {friendlyName}
                      </span>
                    ) : (
                      <Link
                        to={path}
                        className="text-[#A7A7A7] hover:text-primary transition-colors"
                      >
                        {friendlyName}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#F6F8FB] text-[#202224] sm:hidden"
          >
            <Search size={20} strokeWidth={2} />
          </button>

          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-[#F6F8FB] text-[#202224] transition sm:grid sm:h-11 sm:w-11 sm:place-items-center sm:rounded-xl sm:border sm:border-[#D8D8D8] sm:bg-white hover:border-[#FE512E]/50"
              aria-label="Open notifications"
            >
              <NotificationBingIcon className="h-6 w-6" />
              {hasUnread && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#E74C3C] ring-2 ring-white sm:right-3 sm:top-2" />
              )}
            </button>

            {notificationOpen && (
              <NotificationDropdown onClose={() => setNotificationOpen(false)} />
            )}
          </div>

          <Link
            to="/profile"
            className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full border-none bg-transparent hover:bg-transparent sm:h-11 sm:w-auto sm:px-4 sm:rounded-xl transition-colors gap-2 lg:h-12.5 lg:gap-3"
          >
            <Avatar
              src={profileImageUrl || ""}
              name={userName}
              className="h-10 w-10 lg:h-12.5 lg:w-12.5"
            />

            <div className="hidden text-left sm:block">
              <h4 className="text-sm font-bold leading-tight text-(--text-primary) lg:text-sm">
                {userName}
              </h4>
              <p className="mt-0.5 text-xs font-medium text-(--text-light) lg:text-[12px] capitalize">
                {profile?.role || "Admin"}
              </p>
            </div>

            <ChevronDown size={16} className="hidden text-(--text-light) sm:block lg:w-[18px] lg:h-[18px]" strokeWidth={2} />
          </Link>
        </div>

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="fixed inset-0 z-40 sm:hidden">
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close search"
              className="absolute inset-0 bg-black/20"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
            />

            {/* Search bar */}
            <div
              className="absolute inset-x-0 top-16 z-50 bg-white p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search Here"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={18} strokeWidth={2} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="flex shrink-0"
                    >
                      <X size={18} strokeWidth={2} />
                    </button>
                  }
                  className="h-11 rounded-full border-(--border)"
                />

                {/* Mobile Search Results Dropdown */}
                {searchQuery.trim() && (
                  <div className="mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden p-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {filteredSearchItems.length > 0 ? (
                      filteredSearchItems.map((item) => (
                        <button
                          key={item.path + '-' + item.label}
                          onClick={() => {
                            navigate(item.path);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl hover:bg-[#F6F8FB] transition-colors text-sm"
                        >
                          <span className="font-semibold text-gray-800">{item.label}</span>
                          {item.parentLabel && (
                            <span className="text-xs text-gray-400 font-medium capitalize">{item.parentLabel}</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400 font-medium">
                        No results matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="h-16 lg:h-25" />
    </>
  );
}