import {
  MessageSquareWarning,
  User,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
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
      { label: "Expense", path: "/financial-management/expense" },
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
      { label: "Create Complaint", path: "/complaint-tracking" },
      { label: "Request Tracking", path: "/complaint-tracking/request-tracking" },
    ],
  },
  {
    label: "Security Management",
    icon: SecurityManagementIcon,
    path: "/security-management",
    children: [
      { label: "Visitor Logs", path: "/security-management/visitor-logs" },
      { label: "Security Protocols", path: "/security-management/security-protocols" },
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
  {
    label: "Community",
    icon: Users,
    path: "/community/access-forums",
    children: [
      { label: "Access Forums", path: "/community/access-forums" },
      { label: "Polls", path: "/community/polls" },
      { label: "Communities Discussion", path: "/community/discussion" },
    ],
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
    path: "/events-participation",
  },
  {
    label: "Community",
    icon: Users,
    path: "/community/access-forums",
    children: [
      { label: "Access Forums", path: "/community/access-forums" },
      { label: "Polls", path: "/community/polls" },
      { label: "Communities Discussion", path: "/community/discussion" },
    ],
  },
  {
    label: "Payment Portal",
    icon: CreditCard,
    path: "/payment-portal",
    children: [
      { label: "Maintenance Invoices", path: "/payment-portal" },
      { label: "Other Invoices", path: "/payment-portal/other-invoices" },
    ],
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
    path: "/security-management",
    children: [
      { label: "Visitor Tracking", path: "/security-management/visitor-logs" },
      { label: "Emergency Management", path: "/security-management/emergency" },
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
