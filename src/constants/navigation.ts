 import { 
  MessageSquareWarning, 
  User, 
  Calendar, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  UserSearch, 
  AlertTriangle,
  Shield
} from "lucide-react";
import {
  AnnouncementIcon,
  BuildingIcon,
  DashboardIcon,
  FinancialManagementIcon,
  LogoutIcon,
  ResidentManagementIcon,
  SecurityGuardIcon,
  SecurityManagementIcon,
} from "../assets/icons/admin-dashboard-icons";

export interface NavItem {
  label: string;
  icon: any;
  path: string;
  children?: { label: string; path: string }[];
}

export const adminNavigation: NavItem[] = [
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
    path: "/financial-management/income",
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
      { label: "Create Complaint", path: "/complaint-tracking/create-complaint" },
      { label: "Request Tracking", path: "/complaint-tracking/request-tracking" },
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

export const residentNavigation: NavItem[] = [
  {
    label: "Dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
  },
  {
    label: "Personal Detail",
    icon: User,
    path: "/profile",
  },
  {
    label: "Service And Complaint",
    icon: MessageSquareWarning,
    path: "/complaint-tracking",
  },
  {
    label: "Events Participation",
    icon: Calendar,
    path: "/announcement",
  },
  {
    label: "Community",
    icon: Users,
    path: "/community",
  },
  {
    label: "Payment Portal",
    icon: CreditCard,
    path: "/financial-management/income",
  },
  {
    label: "Security Protocols",
    icon: ShieldCheck,
    path: "/security-management/protocols",
  },
];

export const securityNavigation: NavItem[] = [
  {
    label: "Security",
    icon: Shield,
    path: "/security",
    children: [
      { label: "Visitor Tracking", path: "/security-guard" },
      { label: "Emergency Management", path: "/security-management/protocols" },
    ],
  },
];

export const footerNavigation = [
  {
    label: "Logout",
    icon: LogoutIcon,
    danger: true,
  },
];
