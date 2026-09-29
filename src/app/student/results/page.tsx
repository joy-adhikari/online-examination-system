"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Award,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { generateMarksheetPDF } from "@/lib/pdf-generator";

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const regNo = user?.student?.registerNumber || user?.username || "U03ZW25S0092";

  useEffect(() => {
    fetch(`/api/results?registerNumber=${regNo}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [regNo]);

  const handleDownloadPDF = () => {
    if (!data || !data.student || !data.exam) return;
    generateMarksheetPDF({
      student: data.student,
      exam: data.exam,
      subjects: data.subjects,
      summary: data.summary,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Home
          </Link>
          <h1 className="text-2xl font-extrabold text-black dark:text-white">Official Examination Results</h1>
          <p className="text-xs text-zinc-500 font-mono">
            Candidate: <strong>{data?.student?.fullName || user?.name}</strong> ({regNo})
          </p>
        </div>

        {data?.isReleased && !data?.isWithheld && (
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Marksheet (PDF)</span>
          </button>
        )}
      </div>

      {loading && <div className="p-12 text-center text-xs text-zinc-500">Retrieving official ledger...</div>}

      {!loading && data && !data.isReleased && (
        <div className="monochrome-card rounded-2xl p-8 text-center space-y-3">
          <Clock className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-black dark:text-white">Results Pending Official Publication</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            The results for <strong>{data.examTitle}</strong> have not been released by Dr. Annie Christila S. (Dean of Examination).
          </p>
        </div>
      )}

      {!loading && data && data.isReleased && data.isWithheld && (
        <div className="monochrome-card rounded-2xl p-8 text-center space-y-3 border-rose-500/40">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Result Withheld (Malpractice Inquiry)</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {data.withheldReason}
          </p>
        </div>
      )}

      {!loading && data && data.isReleased && !data.isWithheld && (
        <div className="monochrome-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-black text-white p-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">
                SFS COLLEGE EXAMINATION AUTHORITY
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">{data.exam?.title}</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Academic Session: {data.exam?.academicYear} • Verification Code: CEB-{data.student?.registerNumber}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Final Result</span>
              <span className="text-lg font-extrabold text-white">{data.summary?.overallResult}</span>
            </div>
          </div>

          {/* Student Particulars Bar */}
          <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Candidate</span>
              <span className="font-bold text-black dark:text-white text-sm">{data.student?.fullName}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Register Number</span>
              <span className="font-mono font-bold text-black dark:text-white text-sm">{data.student?.registerNumber}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Course</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{data.student?.course}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Semester</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">Semester {data.student?.semester}</span>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4 text-right">Max</th>
                  <th className="py-3 px-4 text-right">Pass</th>
                  <th className="py-3 px-4 text-right">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Revaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.subjects?.map((sub: any) => (
                  <tr key={sub.subjectId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">{sub.code}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">{sub.name}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-500">{sub.maxMarks}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-500">{sub.passMarks}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-black dark:text-white text-sm">
                      {sub.isAbsent ? "AB" : sub.totalMarks}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-black dark:text-white px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {sub.status === "PASS" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 font-mono">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {sub.revaluation ? (
                        <Link
                          href="/student/revaluation"
                          className="text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 font-mono inline-block"
                        >
                          Appeal ({sub.revaluation.status})
                        </Link>
                      ) : (
                        <Link
                          href={`/student/revaluation?subjectId=${sub.subjectId}&code=${sub.code}&marks=${sub.totalMarks}`}
                          className="text-[11px] font-bold text-black dark:text-white underline hover:opacity-80"
                        >
                          Apply Reval
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Summary Box */}
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Total Obtained</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {data.summary?.totalObtainedMarks} / {data.summary?.totalMaxMarks}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Overall Percentage</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {data.summary?.overallPercentage}%
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Semester GPA / CGPA</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {data.summary?.cgpa} / 10.0
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Classification</span>
              <p className="text-sm font-extrabold mt-2 text-black dark:text-white">
                {data.summary?.division}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
