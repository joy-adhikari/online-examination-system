"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Award,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { generateMarksheetPDF } from "@/lib/pdf-generator";

function ResultsContent() {
  const searchParams = useSearchParams();
  const initialReg = searchParams.get("registerNumber") || "";

  const [registerNumber, setRegisterNumber] = useState(initialReg);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (regNo: string) => {
    if (!regNo.trim()) return;
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      const res = await fetch(`/api/results?registerNumber=${encodeURIComponent(regNo.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResultData(data);
      } else {
        setError(data.error || "No examination record found for this Register Number.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReg) {
      fetchResults(initialReg);
    }
  }, [initialReg]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(registerNumber);
  };

  const handleDownloadPDF = () => {
    if (!resultData || !resultData.student || !resultData.exam) return;
    generateMarksheetPDF({
      student: resultData.student,
      exam: resultData.exam,
      subjects: resultData.subjects,
      summary: resultData.summary,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>OFFICIAL EXAMINATION RESULT LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
          Grade Report &amp; Marksheet Verification
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          Enter your candidate University Register Number to verify official grades, marks breakdown, and download institutional transcripts.
        </p>
      </div>

      {/* Register Number Query Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="e.g. U03ZW25S0092"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm shadow-xs font-mono uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm shadow-sm hover:opacity-90 transition-opacity"
        >
          {loading ? "Searching..." : "View Result"}
        </button>
      </form>

      {/* Demo Candidate Links */}
      <div className="text-center text-xs text-zinc-400 font-mono">
        Test examinee numbers:{" "}
        <button
          type="button"
          onClick={() => {
            setRegisterNumber("U03ZW25S0092");
            fetchResults("U03ZW25S0092");
          }}
          className="text-black dark:text-white underline hover:opacity-80 font-bold"
        >
          U03ZW25S0092 (Distinction)
        </button>
        {" • "}
        <button
          type="button"
          onClick={() => {
            setRegisterNumber("U03ZW25S0199");
            fetchResults("U03ZW25S0199");
          }}
          className="text-black dark:text-white underline hover:opacity-80 font-bold"
        >
          U03ZW25S0199 (Revaluation)
        </button>
        {" • "}
        <button
          type="button"
          onClick={() => {
            setRegisterNumber("U03ZW25S0149");
            fetchResults("U03ZW25S0149");
          }}
          className="text-rose-500 underline hover:opacity-80 font-bold"
        >
          U03ZW25S0149 (Withheld)
        </button>
      </div>

      {error && (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-rose-500/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs sm:text-sm text-center max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Unreleased Notice */}
      {resultData && !resultData.isReleased && (
        <div className="monochrome-card rounded-2xl p-8 text-center space-y-3 max-w-xl mx-auto">
          <Clock className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-black dark:text-white">Results Pending Publication</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{resultData.message}</p>
        </div>
      )}

      {/* Withheld Notice */}
      {resultData && resultData.isReleased && resultData.isWithheld && (
        <div className="monochrome-card rounded-2xl p-8 text-center space-y-3 max-w-xl mx-auto border-rose-500/40">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Result Withheld (Malpractice Inquiry)</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{resultData.withheldReason}</p>
        </div>
      )}

      {/* Released Official Marksheet */}
      {resultData && resultData.isReleased && !resultData.isWithheld && (
        <div className="monochrome-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
          {/* Top Banner */}
          <div className="bg-black text-white p-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">
                OFFICIAL GRADE REPORT
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">{resultData.exam?.title}</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Academic Session: {resultData.exam?.academicYear} • Verification Ref: CEB-{resultData.student?.registerNumber}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-md hover:bg-zinc-200 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Marksheet (PDF)</span>
            </button>
          </div>

          {/* Student Particulars Bar */}
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Candidate Name</span>
              <span className="font-bold text-black dark:text-white text-sm">{resultData.student?.fullName}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Register Number</span>
              <span className="font-mono font-bold text-black dark:text-white text-sm">{resultData.student?.registerNumber}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Course / Programme</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{resultData.student?.course}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Semester</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">Semester {resultData.student?.semester}</span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4 text-right">Max</th>
                  <th className="py-3 px-4 text-right">Pass</th>
                  <th className="py-3 px-4 text-right">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {resultData.subjects?.map((sub: any) => (
                  <tr key={sub.subjectId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">{sub.code}</td>
                    <td className="py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-medium">{sub.name}</td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 font-mono">{sub.maxMarks}</td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 font-mono">{sub.passMarks}</td>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Summary Box */}
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Total Obtained</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {resultData.summary?.totalObtainedMarks} / {resultData.summary?.totalMaxMarks}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Aggregate Percentage</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {resultData.summary?.overallPercentage}%
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Semester CGPA / GPA</span>
              <p className="text-xl font-bold font-mono text-black dark:text-white mt-1">
                {resultData.summary?.cgpa} / 10.0
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-xs font-semibold">Classification</span>
              <p className="text-sm font-extrabold mt-2 text-black dark:text-white">
                {resultData.summary?.division}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading results ledger...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
