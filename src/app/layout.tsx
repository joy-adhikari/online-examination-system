import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SFS College Examination Authority | Examination Management System",
  description: "Institutional examination management: examinee roster, live hall attendance, digital script capture, locked mark submissions, result release control, and revaluation appeals.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-[#050507] text-zinc-950 dark:text-zinc-50 flex flex-col font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <DemoSwitcher />
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-black text-zinc-400 text-xs border-t border-zinc-800 py-8 mt-16 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white text-black font-mono font-bold text-[8px] flex items-center justify-center rounded">
                    SFS
                  </div>
                  <span className="font-bold text-white tracking-tight">SFS COLLEGE</span>
                  <span className="text-zinc-500 font-mono">• Examination Management System</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
                  <span>Confidential Examination Protocol</span>
                  <span>•</span>
                  <span>ISO 9001:2015</span>
                  <span>•</span>
                  <span>Audit Enabled</span>
                </div>
              </div>
              <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-[11px] text-zinc-600 font-mono">
                Demo edition: all examination data is stored privately in this browser. Use the reset button in the top bar to restore the sample data.
              </p>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
