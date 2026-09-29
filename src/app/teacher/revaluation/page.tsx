"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  RotateCcw,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { AnswerBookletViewer } from "@/components/AnswerBookletViewer";

export default function TeacherRevaluationPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Evaluate modal state
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [revisedScore, setRevisedScore] = useState<number>(0);
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [showEvalModal, setShowEvalModal] = useState(false);

  // Answer Booklet
  const [bookletPages, setBookletPages] = useState<string[]>([]);
  const [viewingBooklet, setViewingBooklet] = useState<any | null>(null);

  const fetchRevaluations = async () => {
    try {
      const res = await fetch("/api/revaluation");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error("Revaluation fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevaluations();
  }, [user]);

  const handleOpenEvaluate = async (reqItem: any) => {
    setSelectedReq(reqItem);
    setRevisedScore(reqItem.revisedMarks !== null ? reqItem.revisedMarks : reqItem.originalMarks + 8);
    setTeacherRemarks(reqItem.teacherRemarks || "Re-checked Question 4 derivation. Awarded partial step points.");
    setShowEvalModal(true);

    try {
      const res = await fetch(`/api/answer-papers?subjectId=${reqItem.subjectId}&studentId=${reqItem.studentId}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setBookletPages(data.paper.pages);
      }
    } catch (e) {
      console.error("Booklet load error:", e);
    }
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const res = await fetch("/api/revaluation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: "teacher_evaluate",
          revisedMarks: Number(revisedScore),
          teacherRemarks: teacherRemarks.trim(),
          actorName: user?.name || "Santhosh Kumar",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Re-evaluation submitted! Student marks updated successfully.");
        setShowEvalModal(false);
        setSelectedReq(null);
        fetchRevaluations();
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (e) {
      alert("Error submitting revised marks");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ASSIGNED GRADE APPEALS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Revaluation Evaluation Desk</h1>
          <p className="text-xs text-zinc-500">
            Inspect disputed question rubrics, review the digital answer script, and submit finalized revised scores.
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-black dark:text-white">Assigned Appeals Portfolio</span>
          <span className="text-zinc-500">Authorized evaluator double-check</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Appeal ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-right">Original Score</th>
                <th className="py-3 px-4 text-right">Revised Score</th>
                <th className="py-3 px-4">Disputed Inquiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-black dark:text-white">{r.student?.fullName}</p>
                    <p className="font-mono text-[10px] text-zinc-500">{r.student?.registerNumber}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{r.subject?.code}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {r.originalMarks} / 100
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                    {r.revisedMarks !== null ? (
                      <span className="text-black dark:text-white">{r.revisedMarks}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 italic max-w-xs truncate">{r.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEvaluate(r)}
                      className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] shadow-xs inline-flex items-center gap-1 hover:opacity-90"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{r.status === "completed" ? "Update Score" : "Re-Evaluate"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluate Dialog Modal */}
      {showEvalModal && selectedReq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleEvaluateSubmit}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-black dark:text-white text-base">Re-Evaluate Candidate Script</h3>
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Candidate</span>
                <span className="font-bold text-black dark:text-white">{selectedReq.student?.fullName}</span>
                <span className="font-mono text-zinc-500 block">{selectedReq.student?.registerNumber}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Subject</span>
                <span className="font-bold text-black dark:text-white">{selectedReq.subject?.code} - {selectedReq.subject?.name}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold mb-1">Student Stated Appeal</span>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 italic">
                "{selectedReq.reason}"
              </div>
            </div>

            {bookletPages.length > 0 && (
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold mb-1">
                  Scanned Answer Script ({bookletPages.length} pages verified)
                </span>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-black dark:text-white flex items-center justify-between border border-zinc-200 dark:border-zinc-800">
                  <span className="font-mono text-[11px]">Digital script ready for inspection</span>
                  <button
                    type="button"
                    onClick={() =>
                      setViewingBooklet({
                        student: selectedReq.student,
                        subject: selectedReq.subject,
                        totalMarks: revisedScore,
                        pages: bookletPages,
                      })
                    }
                    className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg font-bold text-xs hover:opacity-90"
                  >
                    Open Script Viewer
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Original Awarded Score</span>
                <p className="text-xl font-bold font-mono text-zinc-700 dark:text-zinc-300 mt-1">{selectedReq.originalMarks} / 100</p>
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-1">Revised Total Marks *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={revisedScore}
                  onChange={(e) => setRevisedScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-lg font-bold font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Evaluator Verification Remarks *</label>
              <textarea
                required
                rows={3}
                placeholder="Detail question-by-question re-marking rubric conclusions..."
                value={teacherRemarks}
                onChange={(e) => setTeacherRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-opacity"
              >
                Submit Re-Evaluation Result
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booklet Viewer Modal */}
      {viewingBooklet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="max-w-4xl w-full">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setViewingBooklet(null)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700"
              >
                Close Viewer ✕
              </button>
            </div>
            <AnswerBookletViewer
              studentName={viewingBooklet.student?.fullName}
              registerNumber={viewingBooklet.student?.registerNumber}
              course={viewingBooklet.student?.course || "Computer Science"}
              subjectCode={viewingBooklet.subject?.code || "Subject"}
              subjectName={viewingBooklet.subject?.name || "Exam"}
              maxMarks={100}
              totalMarks={viewingBooklet.totalMarks}
              pages={viewingBooklet.pages || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
