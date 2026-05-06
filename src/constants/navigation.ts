import { MessageSquareWarning, Settings } from "lucide-react";
import {
  AnnouncementIcon,
  BuildingIcon,
  DashboardIcon,
  FinancialManagementIcon,
  LogoutIcon,
  ResidentManagementIcon,
  SecurityGuardIcon,
  SecurityManagementIcon,
} from "../icons/admin-dashboard-icons";

export const adminNavigation = [
  {
    label: "Dashboard",
    icon: DashboardIcon,
    active: true,
  },
  {
    label: "Resident Management",
    icon: ResidentManagementIcon,
  },
  {
    label: "Financial Management",
    icon: FinancialManagementIcon,
    children: ["Income", "Expanse", "Note"],
  },
  {
    label: "Facility Management",
    icon: BuildingIcon,
  },
  {
    label: "Complaint Tracking",
    icon: MessageSquareWarning,
    children: ["Create Complaint", "Request Tracking"],
  },
  {
    label: "Security Management",
    icon: SecurityManagementIcon,
    children: ["Visitor Logs", "Security Protocols"],
  },
  {
    label: "Security Guard",
    icon: SecurityGuardIcon,
  },
  {
    label: "Announcement",
    icon: AnnouncementIcon,
  },
];

export const footerNavigation = [
  {
    label: "Setting",
    icon: Settings,
  },
  {
    label: "Logout",
    icon: LogoutIcon,
    danger: true,
  },
];
