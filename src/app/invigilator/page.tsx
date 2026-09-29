"use client";


import { Avatar } from "@/components/Avatar";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Camera,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function InvigilatorDashboard() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [stats, setStats] = useState({
    totalCandidates: 5,
    present: 4,
    absent: 1,
    papersUploaded: 5,
  });

  useEffect(() => {
    fetch("/api/head/exams")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.subjects?.length > 0) {
          setActiveSession(data.subjects[0]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Session Banner in Black & White */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 font-mono font-bold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
            <Users className="w-3.5 h-3.5" />
            <span>SFS COLLEGE • HALL OPERATIONS</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={user?.name || "Dr. Sailaja Mulakaluri"} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl  border-2 border-zinc-700 shadow-lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.name || "Dr. Sailaja Mulakaluri"}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Hall Invigilator • SFS College, Hall 101 - Main Academic Block
            </p>
          </div>
        </div>

        {activeSession && (
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-300">
            <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700">
              Subject: <strong>{activeSession.code} - {activeSession.name}</strong>
            </span>
            <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700">
              Time: <strong>{activeSession.startTime} - {activeSession.endTime}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Primary Ops Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mark Attendance */}
        <Link
          href="/invigilator/attendance"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
                Mark Attendance
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Check in candidates arriving at Hall 101, mark Present / Absent / Late.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center justify-between text-xs text-black dark:text-white font-bold border-t border-zinc-200 dark:border-zinc-800 font-mono">
            <span>{stats.present} / {stats.totalCandidates} Present</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Upload Answer Papers */}
        <Link
          href="/invigilator/papers"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
                Capture Answer Papers
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Use camera or file picker to upload multi-page answer booklet photos.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center justify-between text-xs text-black dark:text-white font-bold border-t border-zinc-200 dark:border-zinc-800 font-mono">
            <span>{stats.papersUploaded} Booklets Scanned</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Report Malpractice */}
        <Link
          href="/invigilator/malpractice"
          className="monochrome-card p-6 rounded-2xl hover:border-black dark:hover:border-white transition-all space-y-3 group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-black dark:text-white text-base group-hover:underline">
                Report Malpractice
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Instant incident dispatch with photo evidence to Head of Examination.
              </p>
            </div>
          </div>
          <div className="pt-3 flex items-center justify-between text-xs text-black dark:text-white font-bold border-t border-zinc-200 dark:border-zinc-800 font-mono">
            <span>Instant Dispatch</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Guidelines */}
      <div className="monochrome-card rounded-2xl p-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
        <h4 className="font-bold text-black dark:text-white text-sm font-mono uppercase flex items-center gap-1.5">
          <span>Invigilator Operating Procedures</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verify examinee Admit Card &amp; Student ID at the door before seating.</li>
          <li>All attendance checklists must be submitted within 30 minutes of session commencement.</li>
          <li>Answer booklets must be collected in order and photographed page-by-page.</li>
          <li>Confiscated materials must be reported immediately via the Malpractice desk.</li>
        </ul>
      </div>
    </div>
  );
}
