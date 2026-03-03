import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserDetails } from "../api/user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getUserDetails();
      setUser(data);
    } catch {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("empId");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (accessToken, empId) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("empId", empId);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empId");
    localStorage.removeItem("uniqueId");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatStarted");
    localStorage.removeItem("conversationId");
    localStorage.removeItem("selectedEmployee");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ token, user, loading, isAuthenticated, isAdmin, login, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
