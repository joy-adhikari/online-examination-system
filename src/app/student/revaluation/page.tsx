"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Eye,
} from "lucide-react";
import { AnswerBookletViewer } from "@/components/AnswerBookletViewer";

function RevaluationContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preselectedSubjectId = searchParams.get("subjectId") || "";
  const preselectedCode = searchParams.get("code") || "";
  const preselectedMarks = searchParams.get("marks") || "36";

  const regNo = user?.student?.registerNumber || user?.username || "U03ZW25S0199";
  const studentId = user?.student?.id || "stu_5";

  const [existingRequests, setExistingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Application Form State
  const [formSubjectId, setFormSubjectId] = useState(preselectedSubjectId || "subj_cs301");
  const [formOriginalMarks, setFormOriginalMarks] = useState(Number(preselectedMarks) || 36);
  const [reason, setReason] = useState("");

  // Booklet inspection state
  const [inspectingBooklet, setInspectingBooklet] = useState<any | null>(null);

  const fetchExisting = async () => {
    try {
      const res = await fetch("/api/revaluation");
      const data = await res.json();
      if (data.success) {
        const myRequests = (data.requests || []).filter(
          (r: any) => r.student?.registerNumber === regNo || r.studentId === studentId
        );
        setExistingRequests(myRequests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExisting();
  }, [regNo]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide the specific justification or disputed question numbers.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/revaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: "exam_autumn2025",
          subjectId: formSubjectId,
          studentId: studentId,
          originalMarks: formOriginalMarks,
          reason: reason.trim(),
          applicantName: user?.student?.fullName || user?.name || "Ruba",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Revaluation appeal submitted and logged in examination ledger!");
        setReason("");
        fetchExisting();
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectAnswerPaper = async (reqItem: any) => {
    try {
      const res = await fetch(`/api/answer-papers?subjectId=${reqItem.subjectId}&studentId=${reqItem.studentId}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setInspectingBooklet({
          ...reqItem,
          pages: data.paper.pages,
        });
      } else {
        alert("Scanned booklet not available for inspection.");
      }
    } catch (e) {
      alert("Error loading paper");
    }
  };

  const getStepState = (status: string, step: number) => {
    if (status === "completed") return "done";
    if (status === "under_review" || status === "approved") {
      if (step <= 2) return "done";
      return "current";
    }
    if (status === "applied") {
      if (step === 1) return "done";
      if (step === 2) return "current";
      return "pending";
    }
    return "pending";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Home
        </Link>
        <h1 className="text-2xl font-extrabold text-black dark:text-white">Revaluation Appeals &amp; Script Inspection</h1>
        <p className="text-xs text-zinc-500">
          Request formal reassessment of your examination scripts within 15 days of results announcement.
        </p>
      </div>

      {/* Active Appeals List with Stepper */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-black dark:text-white uppercase font-mono tracking-wider">
          Active Revaluation Applications
        </h2>

        {existingRequests.length === 0 ? (
          <div className="monochrome-card rounded-2xl p-8 text-center text-xs text-zinc-500">
            You do not have any active revaluation appeals. You can submit an appeal below.
          </div>
        ) : (
          existingRequests.map((req) => (
            <div
              key={req.id}
              className="monochrome-card rounded-2xl p-6 space-y-6 animate-in fade-in duration-150"
            >
              {/* Top Details Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-black dark:text-white text-sm">
                      {req.subject?.code || "CS301"} - {req.subject?.name || "Database Management Systems"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">
                    Appeal Ref: <strong>{req.id}</strong> • Applied: {new Date(req.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleInspectAnswerPaper(req)}
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Scanned Script &amp; PDF</span>
                </button>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="grid grid-cols-3 gap-2 relative text-center">
                  <div className="space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                        getStepState(req.status, 1) === "done"
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      ✓
                    </div>
                    <span className="font-bold text-xs text-black dark:text-white block">1. Application Filed</span>
                    <span className="text-[11px] text-zinc-500 block font-mono">Logged</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                        getStepState(req.status, 2) === "done"
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                          : getStepState(req.status, 2) === "current"
                          ? "bg-black text-white dark:bg-white dark:text-black animate-pulse"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      2
                    </div>
                    <span className="font-bold text-xs text-black dark:text-white block">2. Evaluator Review</span>
                    <span className="text-[11px] text-zinc-500 block font-mono">Assigned</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                        getStepState(req.status, 3) === "done"
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      3
                    </div>
                    <span className="font-bold text-xs text-black dark:text-white block">3. Revision Sealed</span>
                    <span className="text-[11px] text-zinc-500 block font-mono">Marks Updated</span>
                  </div>
                </div>
              </div>

              {/* Score Outcome Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Original Marks</span>
                  <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-0.5">{req.originalMarks} / 100</p>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Updated / Revised Marks</span>
                  <p className="text-xl font-bold font-mono text-black dark:text-white mt-0.5">
                    {req.revisedMarks !== null ? `${req.revisedMarks} / 100` : "Evaluation In Progress..."}
                  </p>
                </div>
              </div>

              {/* Student Stated Reason */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-black dark:text-white font-mono">Disputed Questions &amp; Rationale:</span>
                <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  "{req.reason}"
                </p>
              </div>

              {/* Evaluator Remarks */}
              {req.teacherRemarks && (
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-black dark:text-white space-y-0.5">
                  <span className="font-bold font-mono uppercase text-[10px] text-zinc-500">Senior Evaluator Remarks:</span>
                  <p>{req.teacherRemarks}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Revaluation Application Form */}
      <div className="monochrome-card rounded-2xl p-6 space-y-5 text-xs">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>Submit Revaluation Appeal</span>
          </h2>
          <p className="text-zinc-500 mt-0.5">
            Select the subject you wish to appeal for independent rubric reassessment.
          </p>
        </div>

        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-black dark:text-white mb-1">Subject to Re-Evaluate *</label>
              <select
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
              >
                <option value="subj_cs301">CS301 - Database Management Systems (Original: 36)</option>
                <option value="subj_cs302">CS302 - Compiler Design &amp; Automata (Original: 75)</option>
                <option value="subj_cs303">CS303 - Computer Networks (Original: 80)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-black dark:text-white mb-1">Revaluation Service</label>
              <div className="flex items-center px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 font-mono text-black dark:text-white">
                <span>Direct Examination Council Appeal</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-black dark:text-white mb-1">
              Disputed Question Numbers &amp; Rubric Justification *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail specific question numbers and rationale (e.g. In Section B, Question 4, derivation arithmetic meets complete rubric specifications...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>{submitting ? "Submitting Appeal..." : "Submit Revaluation Appeal to Head of Examination"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Answer Booklet Viewer Lightbox */}
      {inspectingBooklet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="max-w-4xl w-full">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setInspectingBooklet(null)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700"
              >
                Close Viewer ✕
              </button>
            </div>
            <AnswerBookletViewer
              studentName={user?.student?.fullName || "Ruba"}
              registerNumber={regNo}
              course={user?.student?.course || "B.Tech Computer Science & Engineering"}
              subjectCode={inspectingBooklet.subject?.code || "CS301"}
              subjectName={inspectingBooklet.subject?.name || "Database Management Systems"}
              maxMarks={100}
              totalMarks={inspectingBooklet.revisedMarks !== null ? inspectingBooklet.revisedMarks : inspectingBooklet.originalMarks}
              pages={inspectingBooklet.pages || []}
              evaluatorName="Santhosh Kumar"
              evaluatorRemarks={inspectingBooklet.teacherRemarks || inspectingBooklet.reason}
              allowDownload={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentRevaluationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading revaluation portal...</div>}>
      <RevaluationContent />
    </Suspense>
  );
}
