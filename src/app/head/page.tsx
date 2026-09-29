"use client";


import { Avatar } from "@/components/Avatar";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Globe,
  Lock,
  Unlock,
  AlertOctagon,
  ChevronRight,
} from "lucide-react";

export default function HeadDashboard() {
  const [data, setData] = useState<{
    enrolledStudents: number;
    activeExams: any[];
    openMalpractice: number;
    pendingRevaluation: number;
    recentAudit: any[];
  }>({
    enrolledStudents: 7,
    activeExams: [],
    openMalpractice: 1,
    pendingRevaluation: 1,
    recentAudit: [],
  });

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [regsRes, examsRes, malpRes, revalRes, auditRes] = await Promise.all([
        fetch("/api/head/registrations"),
        fetch("/api/head/exams"),
        fetch("/api/malpractice"),
        fetch("/api/revaluation"),
        fetch("/api/audit-logs?limit=8"),
      ]);

      const [regsData, examsData, malpData, revalData, auditData] = await Promise.all([
        regsRes.json(),
        examsRes.json(),
        malpRes.json(),
        revalRes.json(),
        auditRes.json(),
      ]);

      const totalStus = (regsData.students || []).length;
      const openMalp = (malpData.reports || []).filter((m: any) => m.status === "reported" || m.status === "under_review").length;
      const openReval = (revalData.requests || []).filter((r: any) => r.status === "applied" || r.status === "under_review").length;

      setData({
        enrolledStudents: totalStus,
        activeExams: examsData.exams || [],
        openMalpractice: openMalp,
        pendingRevaluation: openReval,
        recentAudit: auditData.logs || [],
      });
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleResultRelease = async (examId: string, currentStatus: boolean) => {
    setPublishing(examId);
    try {
      const res = await fetch("/api/head/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_results",
          examId,
          isResultReleased: !currentStatus,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        alert(resData.message);
        fetchDashboardData();
      } else {
        alert(resData.error || "Failed to update result release");
      }
    } catch (e) {
      alert("Error updating result release");
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner in Black & White */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name="Dr. Annie Christila S." className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl  border-2 border-zinc-700 shadow-lg" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 font-mono font-bold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
              <Shield className="w-3.5 h-3.5" />
              <span>SFS COLLEGE • HEAD OF EXAMINATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dr. Annie Christila S.</h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Dean of Examinations • SFS College Examination Authority
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/head/registrations"
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Examinee Roster ({data.enrolledStudents})</span>
          </Link>
          <Link
            href="/head/malpractice"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Malpractice Desk ({data.openMalpractice})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Examinees */}
        <Link
          href="/head/registrations"
          className="monochrome-card p-5 rounded-2xl hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Examinees</span>
            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-black dark:text-white font-mono">{data.enrolledStudents}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Verified college roster</p>
          </div>
        </Link>

        {/* Malpractice Cases */}
        <Link
          href="/head/malpractice"
          className="monochrome-card p-5 rounded-2xl hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Malpractice</span>
            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-black dark:text-white font-mono">{data.openMalpractice}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Active inquiries</p>
          </div>
        </Link>

        {/* Revaluation Requests */}
        <Link
          href="/head/revaluation"
          className="monochrome-card p-5 rounded-2xl hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Revaluations</span>
            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-black dark:text-white font-mono">{data.pendingRevaluation}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Pending reviews</p>
          </div>
        </Link>

        {/* Active Examinations */}
        <Link
          href="/head/exams"
          className="monochrome-card p-5 rounded-2xl hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Exam Cycles</span>
            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-black dark:text-white font-mono">{data.activeExams.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Active exam cycles</p>
          </div>
        </Link>
      </div>

      {/* Result Release Management */}
      <div className="monochrome-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Result Publication &amp; Release Control</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Control examinee access to published marks and transcripts per exam cycle.
            </p>
          </div>
          <Link href="/head/exams" className="text-xs font-semibold text-black dark:text-white hover:underline">
            Manage Timetables →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {data.activeExams.map((exam) => (
            <div
              key={exam.id}
              className={`p-4 rounded-xl border transition-all ${
                exam.isResultReleased
                  ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-700"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        exam.isResultReleased
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {exam.isResultReleased ? "Published" : "Withheld"}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Sem {exam.semester}</span>
                  </div>
                  <h3 className="font-bold text-black dark:text-white text-sm mt-1">{exam.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    Session: {exam.academicYear} • Subjects: {exam.subjects?.length || 0}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleResultRelease(exam.id, exam.isResultReleased)}
                  disabled={publishing === exam.id}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                    exam.isResultReleased
                      ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700"
                      : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                  }`}
                >
                  {exam.isResultReleased ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Withdraw Results</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Publish Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Modules & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Administrative Modules */}
        <div className="monochrome-card rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider font-mono">
            Control Center
          </h2>

          <div className="space-y-1.5 text-xs">
            <Link
              href="/head/registrations"
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-black dark:text-white" />
                <div>
                  <p className="font-bold text-black dark:text-white">Examinee Roster</p>
                  <p className="text-zinc-500 text-[11px]">Enrolled college directory &amp; hall tickets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </Link>

            <Link
              href="/head/users"
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-black dark:text-white" />
                <div>
                  <p className="font-bold text-black dark:text-white">Staff Management</p>
                  <p className="text-zinc-500 text-[11px]">Faculty evaluators &amp; invigilators</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </Link>

            <Link
              href="/head/marks"
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-black dark:text-white" />
                <div>
                  <p className="font-bold text-black dark:text-white">Marks &amp; Overrides</p>
                  <p className="text-zinc-500 text-[11px]">Submission unlock &amp; grade adjustments</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </Link>

            <Link
              href="/head/attendance"
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-black dark:text-white" />
                <div>
                  <p className="font-bold text-black dark:text-white">Live Hall Attendance</p>
                  <p className="text-zinc-500 text-[11px]">Real-time invigilator check-ins</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </Link>

            <Link
              href="/head/audit"
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-black dark:text-white" />
                <div>
                  <p className="font-bold text-black dark:text-white">Audit &amp; Export Center</p>
                  <p className="text-zinc-500 text-[11px]">CSV registry &amp; immutable event logs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </Link>
          </div>
        </div>

        {/* Live Examination Audit Trail */}
        <div className="lg:col-span-2 monochrome-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider font-mono">
              Live Examination Audit Trail
            </h2>
            <Link href="/head/audit" className="text-xs text-zinc-500 hover:text-black dark:hover:text-white font-semibold underline">
              View all logs →
            </Link>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-96 overflow-y-auto text-xs">
            {data.recentAudit.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-zinc-500">by {log.userName}</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-xs">{log.details}</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
