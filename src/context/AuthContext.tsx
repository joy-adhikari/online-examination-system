"use client";

// Installs the browser-only backend before any page issues a request.
import "@/lib/mock-api/install";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";

export type ActiveRole = "head" | "teacher" | "invigilator" | "student" | null;

interface AuthContextType {
  user: User | null;
  activeRole: ActiveRole;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoUser: (target: "head" | "teacher" | "invigilator" | "student_normal" | "student_reval" | "student_malp") => Promise<void>;
  setActiveRole: (role: ActiveRole) => void;
  sessionRemaining: number;
  extendSession: () => void;
  isAccountLocked: boolean;
  failedAttempts: number;
  unlockAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS = {
  head: { identifier: "examhead", password: "password123" },
  teacher: { identifier: "santhosh_kumar", password: "password123" },
  invigilator: { identifier: "sailaja_mulakaluri", password: "password123" },
  student_normal: { identifier: "U03ZW25S0092", password: "password123" },
  student_reval: { identifier: "U03ZW25S0199", password: "password123" },
  student_malp: { identifier: "U03ZW25S0149", password: "password123" },
};

const DEFAULT_SESSION_SECONDS = 900; // 15 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionRemaining, setSessionRemaining] = useState<number>(DEFAULT_SESSION_SECONDS);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("exam_app_user");
      const savedRole = localStorage.getItem("exam_app_active_role");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (savedRole) {
          setActiveRole(savedRole as ActiveRole);
        } else {
          determineInitialRole(parsed);
        }
      } else {
        // By default, start as Head for quick demonstration
        switchDemoUser("head");
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Session timer countdown
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      setSessionRemaining((prev) => {
        if (prev <= 1) {
          // Session timeout
          logout();
          alert("Your session has timed out due to inactivity. Please log in again.");
          return DEFAULT_SESSION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  function determineInitialRole(u: User) {
    if (u.role === "head") {
      setActiveRole("head");
    } else if (u.role === "student") {
      setActiveRole("student");
    } else if (u.isTeacher) {
      setActiveRole("teacher");
    } else if (u.isInvigilator) {
      setActiveRole("invigilator");
    } else {
      setActiveRole(null);
    }
  }

  async function login(identifier: string, password: string = "password123") {
    if (isAccountLocked) {
      return { success: false, error: "Account is temporarily locked due to repeated failed attempts. Contact Head of Exam." };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setIsAccountLocked(true);
          return { success: false, error: "Account locked after 5 failed login attempts. Contact administrator." };
        }
        return { success: false, error: data.error || `Invalid credentials (${5 - nextAttempts} attempts remaining)` };
      }

      // Success
      setFailedAttempts(0);
      setUser(data.user);
      localStorage.setItem("exam_app_user", JSON.stringify(data.user));
      determineInitialRole(data.user);
      setSessionRemaining(DEFAULT_SESSION_SECONDS);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Login request failed" };
    }
  }

  function logout() {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem("exam_app_user");
    localStorage.removeItem("exam_app_active_role");
  }

  async function switchDemoUser(target: "head" | "teacher" | "invigilator" | "student_normal" | "student_reval" | "student_malp") {
    setIsLoading(true);
    const creds = DEMO_CREDENTIALS[target];
    await login(creds.identifier, creds.password);
    if (target === "teacher") setActiveRole("teacher");
    if (target === "invigilator") setActiveRole("invigilator");
    if (target === "head") setActiveRole("head");
    if (target.startsWith("student")) setActiveRole("student");
    setIsLoading(false);
  }

  function handleSetActiveRole(role: ActiveRole) {
    setActiveRole(role);
    if (role) {
      localStorage.setItem("exam_app_active_role", role);
    } else {
      localStorage.removeItem("exam_app_active_role");
    }
  }

  function extendSession() {
    setSessionRemaining(DEFAULT_SESSION_SECONDS);
  }

  function unlockAccount() {
    setIsAccountLocked(false);
    setFailedAttempts(0);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isLoading,
        login,
        logout,
        switchDemoUser,
        setActiveRole: handleSetActiveRole,
        sessionRemaining,
        extendSession,
        isAccountLocked,
        failedAttempts,
        unlockAccount,
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
