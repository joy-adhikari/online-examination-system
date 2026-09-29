"use client";


import { Avatar } from "@/components/Avatar";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardList,
  FileCheck,
  RotateCcw,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [revaluationCount, setRevaluationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const [examsRes, revalRes] = await Promise.all([
          fetch("/api/head/exams"),
          fetch(`/api/revaluation${user?.id ? `?teacherId=${user.id}` : ""}`),
        ]);
        const [examsData, revalData] = await Promise.all([examsRes.json(), revalRes.json()]);

        if (examsData.success) {
          const subjects = (examsData.subjects || []).filter(
            (s: any) => !user || s.assignedTeacherId === user.id || user.role === "head" || user.isTeacher
          );
          setAssignedSubjects(subjects);
        }

        if (revalData.success) {
          const assignedToMe = (revalData.requests || []).filter(
            (r: any) => !user || r.assignedTeacherId === user.id || r.status === "under_review"
          );
          setRevaluationCount(assignedToMe.length);
        }
      } catch (e) {
        console.error("Teacher dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || "Santhosh Kumar"} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl  border-2 border-zinc-700 shadow-lg" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300 font-mono font-bold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>SFS COLLEGE • FACULTY EVALUATION DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user ? user.name : "Santhosh Kumar"}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Faculty Evaluator • SFS College, Department of Computer Science
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/teacher/marks"
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-md hover:bg-zinc-200 transition-all flex items-center gap-1.5"
          >
            <span>Enter &amp; Submit Marks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="monochrome-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider">Assigned Subjects</span>
            <p className="text-2xl font-extrabold text-black dark:text-white mt-1 font-mono">{assignedSubjects.length}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Under evaluation portfolio</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <Link
          href="/teacher/revaluation"
          className="monochrome-card p-5 rounded-2xl hover:border-black dark:hover:border-white transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider">Assigned Revaluations</span>
            <p className="text-2xl font-extrabold text-black dark:text-white mt-1 font-mono">{revaluationCount}</p>
            <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">Appeals requiring review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </Link>

        <div className="monochrome-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider">PDF Script Bundling</span>
            <p className="text-2xl font-extrabold text-black dark:text-white mt-1 font-mono">Automated</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Generates on mark submission</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Assigned Subjects Overview */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="font-bold text-black dark:text-white font-mono">Assigned Subjects &amp; Submission Locks</span>
          <span className="text-zinc-500 font-mono">Locked submissions require Head unlock</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Exam Session</th>
                <th className="py-3 px-4">Max / Pass</th>
                <th className="py-3 px-4">Submission Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {assignedSubjects.map((sub) => {
                const isLocked = sub.marksSubmissionStatus === "submitted";
                return (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">{sub.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{sub.name}</td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-mono">{sub.date}</td>
                    <td className="py-3.5 px-4 font-mono text-black dark:text-white">
                      {sub.maxMarks} / {sub.passMarks}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {isLocked ? <Lock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {sub.marksSubmissionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/teacher/marks?subjectId=${sub.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                      >
                        <span>{isLocked ? "Inspect Marks" : "Grade Candidates"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
