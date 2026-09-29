"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Sparkles,
  ClipboardList,
  Camera,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultId = searchParams.get("identifier") || "";

  const { login, isAccountLocked, failedAttempts, unlockAccount } = useAuth();
  const [identifier, setIdentifier] = useState(defaultId);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Login credentials not recognized");
    }
  };

  const fillCredentials = (id: string, pass: string = "password123") => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(
      `Password reset instructions and security token dispatched to ${forgotEmail}. The Head of Examination can also reset access credentials directly from the Head console.`
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="monochrome-card rounded-3xl overflow-hidden shadow-2xl transition-all">
        {/* Card Header in Black */}
        <div className="bg-black text-white px-6 py-8 text-center space-y-2 border-b border-zinc-800">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center mx-auto text-white font-mono font-extrabold text-sm shadow-inner">
            EX
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Portal Authentication</h1>
          <p className="text-zinc-400 text-xs max-w-xs mx-auto">
            Authorized access for Enrolled College Examinees, Evaluators, Invigilators &amp; Administration.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {isAccountLocked ? (
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl space-y-3 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-sm text-black dark:text-white">Account Temporarily Locked</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Locked after 5 consecutive failed attempts. Contact the Head of Examination or reset lockout below.
              </p>
              <button
                type="button"
                onClick={unlockAccount}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl transition-all"
              >
                Reset Lockout Simulator
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-rose-500/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {failedAttempts > 0 && failedAttempts < 5 && (
                <div className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-mono">
                  Security Warning: {5 - failedAttempts} attempt(s) remaining before temporary lockout.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Register No / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. U03ZW25S0092 or examhead"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Authenticate to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Instant Demo Accounts autofill in Monochrome */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block text-center">
              ⚡ Instant Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials("examhead")}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-left transition-colors"
              >
                <div className="font-bold text-black dark:text-white flex items-center gap-1 text-[11px]">
                  <Shield className="w-3 h-3" />
                  <span>Dr. Annie Christila S.</span>
                </div>
                <span className="text-[10px] text-zinc-500">Head of Exam • examhead</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("santhosh_kumar")}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-left transition-colors"
              >
                <div className="font-bold text-black dark:text-white flex items-center gap-1 text-[11px]">
                  <ClipboardList className="w-3 h-3" />
                  <span>Santhosh Kumar</span>
                </div>
                <span className="text-[10px] text-zinc-500">Teacher • santhosh_kumar</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("sailaja_mulakaluri")}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-left transition-colors"
              >
                <div className="font-bold text-black dark:text-white flex items-center gap-1 text-[11px]">
                  <Camera className="w-3 h-3" />
                  <span>Dr. Sailaja M.</span>
                </div>
                <span className="text-[10px] text-zinc-500">Invigilator • sailaja_mulakaluri</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("U03ZW25S0092")}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-left transition-colors"
              >
                <div className="font-bold text-black dark:text-white flex items-center gap-1 text-[11px]">
                  <GraduationCap className="w-3 h-3" />
                  <span>Examinee</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">U03ZW25S0092</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => fillCredentials("akhil_kumar")}
              className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-left transition-colors"
            >
              <div className="font-bold text-black dark:text-white flex items-center gap-1 text-[11px]">
                <ClipboardList className="w-3 h-3" />
                <span>Mr. Akhil Kumar K M — Teacher &amp; Invigilator</span>
              </div>
              <span className="text-[10px] text-zinc-500">akhil_kumar</span>
            </button>
            <p className="text-[10px] text-zinc-400 font-mono text-center">Default demo password: <code>password123</code></p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              <span>Password Recovery</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Enter your college email address or contact the Examination Office directly for an immediate credential reset.
            </p>

            {forgotMsg ? (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-xs rounded-xl border border-zinc-300 dark:border-zinc-700">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="your.email@sfscollege.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl"
                >
                  Request Password Reset
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotMsg("");
              }}
              className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading portal login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
