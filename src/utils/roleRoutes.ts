import type { UserRole } from "../types/auth";


export const normalizeRole = (role?: string | null): UserRole | null => {
  const value = role?.toLowerCase().trim();

  if (!value) return null;
  if (["admin", "society_manager", "societymanager", "manager"].includes(value)) return "admin";
  if (["resident", "owner", "tenant"].includes(value)) return "resident";
  if (["security", "guard", "securityguard", "security_guard"].includes(value)) return "security";

  return null;
};

export const roleHomePath: Record<UserRole, string> = {
  admin: "/dashboard",
  resident: "/dashboard",
  security: "/security-management/visitor-logs",
};

export const getRoleHomePath = (role?: string | null) => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? roleHomePath[normalizedRole] : "/login";
};

export const adminOnlyPaths = [
  "/resident-management",
  "/resident-management/add",
  "/resident-management/edit/:id",
  "/financial-management",
  "/financial-management/income",
  "/financial-management/expense",
  "/financial-management/note",
  "/facility-management",
  "/complaint-tracking",
  "/complaint-tracking/request-tracking",
  "/security-management/visitor-logs",
  "/security-management/security-protocols",
  "/security-guard",
  "/announcement",
] as const;

export const residentOnlyPaths = [
  "/profile",
  "/complaint-tracking",
  "/events-participation",
  "/community/access-forums",
  "/community/polls",
  "/community/discussion",
  "/payment-portal",
  "/payment-portal/maintenance-invoices",
  "/payment-portal/other-invoices",
  "/payment-portal/event-invoices",
  "/security-management/protocols",
] as const;

export const securityOnlyPaths = [
  "/security-management/visitor-logs",
  "/security-management/emergency",
] as const;

/** Shared routes accessible by both admin and resident */
export const sharedAdminResidentPaths = [
  "/dashboard",
  "/complaint-tracking",
  "/complaint-tracking/create-complaint",
  "/community/access-forums",
  "/community/polls",
  "/community/discussion"
] as const;
