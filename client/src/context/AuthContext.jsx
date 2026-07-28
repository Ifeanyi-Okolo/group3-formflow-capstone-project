import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const storageKey = "admin-dashboard-user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        window.localStorage.removeItem(storageKey);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ name, email }) => {
    const response = await api.post("/auth/login", { name, email });
    const userData = response.data.data;
    setUser(userData);
    window.localStorage.setItem(
      "admin-dashboard-user",
      JSON.stringify(userData),
    );
    return userData;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(storageKey);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
