"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Search,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function InvigilatorAttendancePage() {
  const { user } = useAuth();
  const [examId, setExamId] = useState("exam_autumn2025");
  const [subjectId, setSubjectId] = useState("subj_cs301");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?examId=${examId}&subjectId=${subjectId}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.attendance || []);
      }
    } catch (e) {
      console.error("Attendance fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [examId, subjectId]);

  const handleStatusChange = (studentId: string, newStatus: "present" | "absent" | "late") => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          subjectId,
          records: records.map((r) => ({
            studentId: r.studentId,
            status: r.status,
            notes: r.notes,
          })),
          markedById: user?.id || "usr_staff_sailaja",
          markerName: user?.name || "Dr. Sailaja Mulakaluri",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Attendance verified and saved successfully!");
        fetchAttendance();
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "present" })));
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      (r.registerNumber && r.registerNumber.toLowerCase().includes(q)) ||
      r.seatNumber.toLowerCase().includes(q)
    );
  });

  const stats = {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    total: records.length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header with Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/invigilator"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hall Ops
          </Link>
          <h1 className="text-2xl font-extrabold text-black dark:text-white">Hall Attendance Checklist</h1>
          <p className="text-xs text-zinc-500 font-mono">Hall 101 • CS301 Database Systems</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Attendance"}</span>
          </button>
        </div>
      </div>

      {/* Counters & Filter */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="text-zinc-500">
            Total: <strong>{stats.total}</strong>
          </span>
          <span className="text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            Present: {stats.present}
          </span>
          <span className="text-rose-500 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
            Absent: {stats.absent}
          </span>
          <span className="text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
            Late: {stats.late}
          </span>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
          />
        </div>
      </div>

      {/* Candidates Attendance List */}
      <div className="space-y-3">
        {filtered.map((cand) => (
          <div
            key={cand.studentId}
            className="monochrome-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
          >
            {/* Student Info */}
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-extrabold flex items-center justify-center text-sm shrink-0">
                {cand.seatNumber}
              </span>
              <div>
                <p className="font-bold text-black dark:text-white text-sm">{cand.fullName}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5 font-mono">
                  <span className="text-black dark:text-white font-bold">{cand.registerNumber}</span>
                  <span>•</span>
                  <span>{cand.course}</span>
                </div>
              </div>
            </div>

            {/* Tap Status Toggles */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono">
              <button
                type="button"
                onClick={() => handleStatusChange(cand.studentId, "present")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  cand.status === "present"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-zinc-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(cand.studentId, "absent")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  cand.status === "absent"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-zinc-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Absent</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(cand.studentId, "late")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  cand.status === "late"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-zinc-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Late</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
