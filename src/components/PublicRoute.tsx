import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath } from "../utils/roleRoutes";

/**
 * Guard for public routes (Login, Register, etc.)
 * If the user is already logged in, redirect them to their role's home path.
 */
export default function PublicRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FE512E] border-t-transparent" />
      </div>
    );
  }

  // If user is authenticated, redirect to their home path
  if (user && role) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return <Outlet />;
}
