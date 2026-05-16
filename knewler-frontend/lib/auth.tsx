"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("knewler_token");
    const storedUser = localStorage.getItem("knewler_user");
    if (storedToken) {
      tokenRef.current = storedToken;
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // corrupted storage
      }
    }
    setIsLoading(false);
  }, []);

  function login(token: string, userData: User) {
    tokenRef.current = token;
    localStorage.setItem("knewler_token", token);
    localStorage.setItem("knewler_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    tokenRef.current = null;
    localStorage.removeItem("knewler_token");
    localStorage.removeItem("knewler_user");
    setUser(null);
  }

  function getToken() {
    return tokenRef.current;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
