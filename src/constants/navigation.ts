import { MessageSquareWarning } from "lucide-react";
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
    path: "/dashboard",
  },
  {
    label: "Resident Management",
    icon: ResidentManagementIcon,
    path: "/resident-management",
  },
  {
    label: "Financial Management",
    icon: FinancialManagementIcon,
    path: "/financial-management",
    children: [
      { label: "Income", path: "/financial-management/income" },
      { label: "Expanse", path: "/financial-management/expense" },
      { label: "Note", path: "/financial-management/note" },
    ],
  },
  {
    label: "Facility Management",
    icon: BuildingIcon,
    path: "/facility-management",
  },
  {
    label: "Complaint Tracking",
    icon: MessageSquareWarning,
    path: "/complaint-tracking",
    children: [
      { label: "Create Complaint", path: "/complaint-tracking/create" },
      { label: "Request Tracking", path: "/complaint-tracking/request" },
    ],
  },
  {
    label: "Security Management",
    icon: SecurityManagementIcon,
    path: "/security-management",
    children: [
      { label: "Visitor Logs", path: "/security-management/visitor-logs" },
      { label: "Security Protocols", path: "/security-management/protocols" },
    ],
  },
  {
    label: "Security Guard",
    icon: SecurityGuardIcon,
    path: "/security-guard",
  },
  {
    label: "Announcement",
    icon: AnnouncementIcon,
    path: "/announcement",
  },
];

export const footerNavigation = [
  {
    label: "Logout",
    icon: LogoutIcon,
    danger: true,
  },
];
