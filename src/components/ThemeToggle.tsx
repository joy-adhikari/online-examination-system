"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-[68px] rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="theme-toggle group relative flex h-9 w-[68px] items-center rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner transition-all duration-300 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-out ${
          isDark
            ? "translate-x-8 rotate-0 bg-indigo-500 text-white"
            : "translate-x-0 rotate-0 bg-white text-amber-500"
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-4 w-4" />}
      </span>
      <Sun className={`ml-1 h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-40" : "opacity-0"}`} />
      <Moon className={`ml-auto mr-1 h-3.5 w-3.5 transition-opacity ${isDark ? "opacity-0" : "opacity-40"}`} />
    </button>
  );
}
