"use client";


import { Avatar } from "@/components/Avatar";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Award,
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronRight,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [resultSummary, setResultSummary] = useState<any | null>(null);
  const [revalStatus, setRevalStatus] = useState<any | null>(null);

  const regNo = user?.student?.registerNumber || user?.username || "U03ZW25S0092";
  const studentName = user?.student?.fullName || user?.name || "Joy Adhikari";
  const course = user?.student?.course || "B.Tech Computer Science & Engineering";

  useEffect(() => {
    fetch(`/api/results?registerNumber=${regNo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResultSummary(data);
        }
      })
      .catch((e) => console.error(e));

    fetch("/api/revaluation")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.requests?.length > 0) {
          const myReval = data.requests.find(
            (rv: any) => rv.student?.registerNumber === regNo || rv.studentId === user?.student?.id
          );
          if (myReval) setRevalStatus(myReval);
        }
      })
      .catch((e) => console.error(e));
  }, [user, regNo]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Student Welcome Banner in Black & White */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={studentName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl  border-2 border-zinc-700 shadow-md" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
              CANDIDATE EXAMINATION PORTAL
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{studentName}</h1>
            <p className="text-xs text-zinc-400 font-mono">
              Register No: <strong className="text-white">{regNo}</strong> • {course}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/student/profile"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-zinc-300" />
            <span>My Profile</span>
          </Link>
          <Link
            href="/student/admit-card"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-300" />
            <span>Digital Admit Card</span>
          </Link>
          <Link
            href="/student/results"
            className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-md hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Published Results</span>
          </Link>
        </div>
      </div>

      {/* Revaluation Alert Badge if any */}
      {revalStatus && (
        <div className="monochrome-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-black dark:text-white shrink-0" />
            <div>
              <p className="font-bold text-black dark:text-white">Active Revaluation Appeal: {revalStatus.subject?.code}</p>
              <p className="text-zinc-500 text-[11px] font-mono">
                Status: <strong className="uppercase">{revalStatus.status}</strong> • Original: {revalStatus.originalMarks}
                {revalStatus.revisedMarks !== null && ` → Revised: ${revalStatus.revisedMarks}`}
              </p>
            </div>
          </div>
          <Link
            href="/student/revaluation"
            className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs shrink-0"
          >
            Track Status
          </Link>
        </div>
      )}

      {/* Student Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admit Card */}
        <Link
          href="/student/admit-card"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
              Hall Ticket / Admit Card
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Official verified hall ticket with seat allocation, subject schedule timetable, candidate photo, and examination hall rules.
            </p>
          </div>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white font-bold">
            <span>Download &amp; Print</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Results & Marksheet */}
        <Link
          href="/student/results"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
              Official Examination Results
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Subject-wise marks, final CGPA, passing distinction, and downloadable official signed marksheet transcript.
            </p>
          </div>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white font-bold">
            <span>{resultSummary?.isReleased ? "Results Released" : "Pending Release"}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Revaluation Appeals */}
        <Link
          href="/student/revaluation"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
              Revaluation &amp; Script Inspection
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Request formal reassessment of your examination scripts within the application window and track senior evaluator remarks.
            </p>
          </div>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white font-bold">
            <span>Apply / View Appeals</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Examination Timetable */}
      <div className="monochrome-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Semester Examination Timetable &amp; Hall Allocation</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Designated Hall: Hall 101</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-black dark:text-white">CS301</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Database Management Systems</p>
              <p className="text-zinc-500 text-[11px] font-mono">09:30 AM - 12:30 PM • Hall 101</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-mono">
              Completed
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-black dark:text-white">CS302</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Compiler Design &amp; Automata</p>
              <p className="text-zinc-500 text-[11px] font-mono">09:30 AM - 12:30 PM • Hall 101</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-mono">
              Completed
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-black dark:text-white">CS303</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Computer Networks</p>
              <p className="text-zinc-500 text-[11px] font-mono">09:30 AM - 12:30 PM • Hall 204</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-mono">
              Completed
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-black dark:text-white">CS304</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Software Engineering</p>
              <p className="text-zinc-500 text-[11px] font-mono">02:00 PM - 05:00 PM • Hall 101</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-mono">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
