"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, GraduationCap, ClipboardCheck, Users, Sparkles, RefreshCw, ChevronDown } from "lucide-react";

export function DemoSwitcher() {
  const { user, activeRole, switchDemoUser, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleResetData = async () => {
    if (!confirm("Reset database to initial demo state? This will restore all standard exam records.")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/seed?force=true");
      const data = await res.json();
      if (data.success) {
        alert("Demo state restored successfully!");
        window.location.reload();
      }
    } catch (e) {
      alert("Failed to reset demo data");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-black text-white text-xs px-3 sm:px-6 py-2 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px] uppercase text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Quick Role Simulator:</span>
        </span>
        <span className="font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[11px]">
          {user ? `${user.name} [${user.role.toUpperCase()}]` : "Guest"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => switchDemoUser("head")}
          disabled={isLoading}
          title="Dr. Annie Christila S. - Head of Examination"
          className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs font-semibold ${
            activeRole === "head"
              ? "bg-white text-black shadow-xs ring-1 ring-zinc-200"
              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Head: Annie Christila</span>
        </button>

        <button
          type="button"
          onClick={() => switchDemoUser("teacher")}
          disabled={isLoading}
          title="Santhosh Kumar - Teacher"
          className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs font-semibold ${
            activeRole === "teacher"
              ? "bg-white text-black shadow-xs ring-1 ring-zinc-200"
              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Teacher: Santhosh</span>
        </button>

        <button
          type="button"
          onClick={() => switchDemoUser("invigilator")}
          disabled={isLoading}
          title="Dr. Sailaja Mulakaluri - Invigilator"
          className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs font-semibold ${
            activeRole === "invigilator"
              ? "bg-white text-black shadow-xs ring-1 ring-zinc-200"
              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Invigilator: Sailaja</span>
        </button>

        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs font-semibold ${
              activeRole === "student"
                ? "bg-white text-black shadow-xs ring-1 ring-zinc-200"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Examinees</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
              <button
                type="button"
                onClick={() => {
                  switchDemoUser("student_normal");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-xs flex flex-col transition-colors"
              >
                <span className="font-bold text-white">Joy Adhikari (U03ZW25S0092)</span>
                <span className="text-[10px] text-zinc-400">Regular Candidate • Passed with Distinction</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoUser("student_reval");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-xs flex flex-col border-t border-zinc-800/80 transition-colors"
              >
                <span className="font-bold text-white">Ruba (U03ZW25S0199)</span>
                <span className="text-[10px] text-zinc-400">Revaluation Appeal Active (CS301)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoUser("student_malp");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-xs flex flex-col border-t border-zinc-800/80 transition-colors"
              >
                <span className="font-bold text-white">Mary (U03ZW25S0149)</span>
                <span className="text-[10px] text-zinc-400">Malpractice Inquiry • Result Withheld</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleResetData}
          disabled={seeding}
          title="Reset database to demo baseline"
          className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors border border-zinc-800 ml-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-white" : ""}`} />
        </button>
      </div>
    </div>
  );
}
