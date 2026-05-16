import { useEffect, useState } from "react";
import { authApi } from "../../../services/api";
import Profile from "./Profile";
import PersonalDetail from "./PersonalDetail";
import { Loader2 } from "lucide-react";

export default function ProfileSelector() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await authApi.getProfile();
        if (data.user) {
          setRole(data.user.role?.toLowerCase() || "admin");
        }
      } catch (error) {
        console.error("Failed to fetch role for profile selector:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Render high-fidelity Profile for Admins, PersonalDetail for Residents
  return role === "admin" ? <Profile /> : <PersonalDetail />;
}
