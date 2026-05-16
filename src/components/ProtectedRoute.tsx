import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";
import { getRoleHomePath } from "../utils/roleRoutes";

interface ProtectedRouteProps {
  /** Which roles are allowed to access this route.
   *  Pass an empty array / undefined to mean "any authenticated user". */
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

/**
 * Wraps a route element and enforces authentication + role-based access.
 *
 * - Not logged in  → redirect to /login
 * - Logged in but wrong role → redirect to their home path (e.g. /dashboard)
 * - OK → render children or Outlet
 */
export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // While the profile is being fetched show nothing (or a spinner)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FE512E] border-t-transparent" />
      </div>
    );
  }

  // Not authenticated at all
  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not in the allowed roles for this route
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
