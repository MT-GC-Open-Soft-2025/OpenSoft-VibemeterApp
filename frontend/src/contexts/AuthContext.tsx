import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { signin } from "@/api/auth";
import { getUserDetails } from "@/api/user";
import { mapBackendUser, type MockUser } from "@/lib/mock-data";

interface AuthContextType {
  user: MockUser | null;
  token: string | null;
  loading: boolean;
  login: (company: string, employeeId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const fetchUser = useCallback(async () => {
    try {
      const data = await getUserDetails();
      const stored = sessionStorage.getItem("wellbee_user");
      const storedCompany = stored ? JSON.parse(stored).company : "";
      const mapped = mapBackendUser({ ...data, company: storedCompany });
      setUser(mapped);
      sessionStorage.setItem("wellbee_user", JSON.stringify(mapped));
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("empId");
    }
  }, []);

  // On mount, if token exists, fetch user
  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (_company: string, employeeId: string, password: string) => {
    try {
      const data = await signin(employeeId, password);
      const accessToken = data.access_token;
      if (!accessToken) {
        return { success: false, error: "Invalid response from server" };
      }
      localStorage.setItem("token", accessToken);
      localStorage.setItem("empId", employeeId);
      setToken(accessToken);

      // Fetch user details with the new token
      try {
        const userData = await getUserDetails();
        const mapped = mapBackendUser({ ...userData, company: _company });
        setUser(mapped);
        sessionStorage.setItem("wellbee_user", JSON.stringify(mapped));
      } catch {
        // If user details fail, still consider login successful
        const fallback = mapBackendUser({ emp_id: employeeId, role: "employee", company: _company });
        setUser(fallback);
        sessionStorage.setItem("wellbee_user", JSON.stringify(fallback));
      }

      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || "Login failed";
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("empId");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("conversationId");
    sessionStorage.removeItem("wellbee_user");
    sessionStorage.removeItem("wellbee_onboarded");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="text-4xl block mb-3">🌿</span>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
