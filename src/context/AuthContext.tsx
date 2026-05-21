import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";
import { normalizeRole } from "../utils/roleRoutes";
import type { UserRole } from "../types/auth";

interface AuthUser {
  _id: string;
  role: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  refetch: async () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getProfile();
      const profileUser: AuthUser = data.user ?? data;
      setUser(profileUser);
      setRole(normalizeRole(profileUser?.role));
    } catch {
      // Token invalid / expired
      setUser(null);
      setRole(null);
      // localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, refetch: fetchProfile, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
