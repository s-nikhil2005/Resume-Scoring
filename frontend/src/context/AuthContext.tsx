"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/types/auth";
import { loginUser, registerUser, logoutUser, getMe } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const currentUser = await getMe();
        if (isMounted) setUser(currentUser);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (data: { email: string; password: string }): Promise<User> => {
    const res = await loginUser(data);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; password: string }): Promise<User> => {
    const res = await registerUser(data);
    setUser(res.newUser);
    return res.newUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout error on server:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
