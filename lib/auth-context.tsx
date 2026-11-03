"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "./axios";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string | null;
  address?: string | null;
  logo?: string | null;
  settings?: {
    currency: string;
    timezone: string;
    defaultTaxPercent: number;
  };
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerOrg: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/admin/auth/profile");
      const data = response.data?.data;
      if (data) {
        setUser(data.user);
        setOrganization(data.organization);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("organization", JSON.stringify(data.organization));
        localStorage.setItem("organizationId", data.organization.id);
      }
    } catch {
      // If fetching profile fails (e.g. invalid token), clear and set null
      setUser(null);
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Try restoring from cache first for instant render
      const cachedUser = localStorage.getItem("user");
      const cachedOrg = localStorage.getItem("organization");
      if (cachedUser && cachedOrg) {
        try {
          setUser(JSON.parse(cachedUser));
          setOrganization(JSON.parse(cachedOrg));
        } catch {
          // ignore cache parse errors
        }
      }
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post("/admin/auth/login", { email, password });
    const data = response.data?.data;

    if (data?.tokens) {
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      localStorage.setItem("organizationId", data.organization.id);

      setUser(data.user);
      setOrganization(data.organization);
      router.push("/");
    }
  };

  const registerOrg = async (payload: any) => {
    const response = await apiClient.post("/admin/auth/register", payload);
    const data = response.data?.data;

    if (data?.tokens) {
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      localStorage.setItem("organizationId", data.organization.id);

      setUser(data.user);
      setOrganization(data.organization);
      router.push("/");
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/admin/auth/logout");
    } catch {
      // Proceed even if network logout fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      localStorage.removeItem("organizationId");
      setUser(null);
      setOrganization(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerOrg,
        logout,
        refreshProfile: fetchProfile,
      }}
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

