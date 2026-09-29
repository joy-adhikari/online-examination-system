"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  GraduationCap,
  Shield,
  FileCheck,
  ClipboardList,
  Clock,
  LogOut,
  UserCheck,
  AlertOctagon,
  Award,
  BookOpen,
  Menu,
  X,
  FileText,
  Search,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, activeRole, logout, sessionRemaining, extendSession } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const minutes = Math.floor(sessionRemaining / 60);
  const seconds = sessionRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const getNavLinks = () => {
    if (activeRole === "head") {
      return [
        { label: "Dashboard", href: "/head" },
        { label: "Examinee Roster", href: "/head/registrations" },
        { label: "Staff Accounts", href: "/head/users" },
        { label: "Exams & Halls", href: "/head/exams" },
        { label: "Attendance", href: "/head/attendance" },
        { label: "Marks Control", href: "/head/marks" },
        { label: "Malpractice Desk", href: "/head/malpractice" },
        { label: "Revaluation", href: "/head/revaluation" },
        { label: "Audit & Reports", href: "/head/audit" },
      ];
    }

    if (activeRole === "teacher") {
      return [
        { label: "Dashboard", href: "/teacher" },
        { label: "Mark Entry", href: "/teacher/marks" },
        { label: "Revaluation Appeals", href: "/teacher/revaluation" },
      ];
    }

    if (activeRole === "invigilator") {
      return [
        { label: "Hall Ops", href: "/invigilator" },
        { label: "Mark Attendance", href: "/invigilator/attendance" },
        { label: "Answer Paper Capture", href: "/invigilator/papers" },
        { label: "Report Malpractice", href: "/invigilator/malpractice" },
      ];
    }

    if (activeRole === "student") {
      return [
        { label: "Examinee Home", href: "/student" },
        { label: "My Profile", href: "/student/profile" },
        { label: "Admit Card / Hall Ticket", href: "/student/admit-card" },
        { label: "Results & Marksheet", href: "/student/results" },
        { label: "Revaluation Request", href: "/student/revaluation" },
      ];
    }

    return [
      { label: "Home", href: "/" },
      { label: "Verify Results", href: "/results" },
      { label: "Portal Login", href: "/login" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo in Monochrome */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono font-extrabold text-xs shadow-md transition-transform group-hover:scale-105">
                SFS
              </div>
              <div>
                <span className="font-extrabold text-black dark:text-white tracking-tight text-base block leading-none">
                  SFS<span className="text-zinc-500 font-normal">//COLLEGE</span>
                </span>
                <span className="text-[9px] tracking-widest font-bold text-zinc-500 uppercase block mt-0.5">
                  Examination Management System
                </span>
              </div>
            </Link>

            {/* Active Role Indicator Badge */}
            {activeRole && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {activeRole === "head" && <Shield className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                {activeRole === "teacher" && <ClipboardList className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                {activeRole === "invigilator" && <UserCheck className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                {activeRole === "student" && <Award className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                <span className="capitalize">{activeRole} Mode</span>
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Timer */}
            {user && (
              <div
                title="Active Session Security Timeout"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-mono"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                <span>{timeFormatted}</span>
                <button
                  type="button"
                  onClick={extendSession}
                  className="text-[10px] text-zinc-900 dark:text-zinc-100 font-bold underline ml-1 hover:opacity-80"
                >
                  Extend
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationDropdown />

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-black dark:text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/results"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify Results</span>
                </Link>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-black dark:text-black dark:bg-white hover:opacity-90 transition-opacity"
                >
                  Portal Login
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex flex-col gap-1 pb-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 px-3">
                <span>Session: {timeFormatted}</span>
                <button type="button" onClick={extendSession} className="text-black dark:text-white font-bold underline">
                  Extend
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
