"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Unlock,
  Edit3,
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { AnswerBookletViewer } from "@/components/AnswerBookletViewer";

export default function HeadMarksPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [marksData, setMarksData] = useState<any[]>([]);
  const [currentSubject, setCurrentSubject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Override modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedMark, setSelectedMark] = useState<any | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState("");

  // Answer booklet modal
  const [viewingBooklet, setViewingBooklet] = useState<any | null>(null);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/head/exams");
      const data = await res.json();
      if (data.success && data.exams?.length > 0) {
        setExams(data.exams);
        setSubjects(data.subjects || []);
        const firstExam = data.exams[0];
        setSelectedExamId(firstExam.id);
        const firstSub = data.subjects?.find((s: any) => s.examId === firstExam.id);
        if (firstSub) setSelectedSubjectId(firstSub.id);
      }
    } catch (e) {
      console.error("Exams fetch error:", e);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchMarks = async (subjectId: string) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marks?subjectId=${subjectId}`);
      const data = await res.json();
      if (data.success) {
        setMarksData(data.marks || []);
        setCurrentSubject(data.subject || null);
      }
    } catch (e) {
      console.error("Marks fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      fetchMarks(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleUnlockSubject = async () => {
    if (!confirm(`Unlock mark submission for ${currentSubject?.code}? This will allow the teacher to edit and resubmit scores.`)) {
      return;
    }

    try {
      const res = await fetch("/api/marks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "head_unlock",
          subjectId: selectedSubjectId,
          requesterName: "Dr. Annie Christila S. (Head of Exam)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Subject marks unlocked for teacher modification.");
        fetchMarks(selectedSubjectId);
      } else {
        alert(data.error || "Failed to unlock");
      }
    } catch (e) {
      alert("Error unlocking marks");
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMark) return;

    try {
      const res = await fetch("/api/marks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "head_override",
          markId: selectedMark.id,
          totalMarks: Number(newScore),
          reason: overrideReason.trim(),
          requesterName: "Dr. Annie Christila S. (Head of Exam)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Mark updated and audit log recorded.");
        setShowOverrideModal(false);
        setSelectedMark(null);
        fetchMarks(selectedSubjectId);
      } else {
        alert(data.error || "Override failed");
      }
    } catch (e) {
      alert("Error updating score");
    }
  };

  const handleViewBooklet = async (mark: any) => {
    try {
      const res = await fetch(`/api/answer-papers?subjectId=${mark.subjectId}&studentId=${mark.studentId}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setViewingBooklet({
          ...mark,
          pages: data.paper.pages,
        });
      } else {
        alert("No scanned answer booklet found for this candidate.");
      }
    } catch (e) {
      alert("Error loading booklet");
    }
  };

  const currentExamSubjects = subjects.filter((s) => s.examId === selectedExamId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <FileCheck className="w-3.5 h-3.5" />
            <span>MARKS OVERSIGHT &amp; AUDIT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Central Marks Review &amp; Control</h1>
          <p className="text-xs text-zinc-500">
            Inspect marks submitted by evaluators. Unlock submissions for corrections or execute direct administrative overrides.
          </p>
        </div>
      </div>

      {/* Selectors & Controls */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider mb-1">
              Select Exam
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                const sub = subjects.find((s) => s.examId === e.target.value);
                if (sub) setSelectedSubjectId(sub.id);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold"
            >
              {currentExamSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lock / Unlock Status & Button */}
        {currentSubject && (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
              Status: {currentSubject.marksSubmissionStatus}
            </span>

            {currentSubject.marksSubmissionStatus === "submitted" && (
              <button
                type="button"
                onClick={handleUnlockSubject}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock for Teacher</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs gap-2">
          <div>
            <span className="font-bold text-black dark:text-white">{currentSubject?.code} - {currentSubject?.name}</span>
            <span className="text-zinc-400 mx-2">•</span>
            <span className="text-zinc-500 font-mono">Max Marks: {currentSubject?.maxMarks} | Passing: {currentSubject?.passMarks}</span>
          </div>
          <span className="text-zinc-600 dark:text-zinc-400 font-mono">Assigned Teacher: {currentSubject?.assignedTeacherName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4 text-right">Theory</th>
                <th className="py-3 px-4 text-right">Practical</th>
                <th className="py-3 px-4 text-right">Total Marks</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Remarks / Audit Note</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {marksData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No marks records submitted for this subject yet.
                  </td>
                </tr>
              ) : (
                marksData.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">{m.student?.registerNumber}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{m.student?.fullName}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">{m.theoryMarks}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">{m.practicalMarks}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-black dark:text-white text-sm">
                      {m.isAbsent ? "AB" : m.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 italic max-w-xs truncate">{m.remarks || "—"}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewBooklet(m)}
                          title="View digitized answer script scan"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMark(m);
                            setNewScore(m.totalMarks);
                            setOverrideReason("");
                            setShowOverrideModal(true);
                          }}
                          title="Direct administrative mark override"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Booklet Inspector Modal */}
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
              subjectCode={currentSubject?.code || "Subject"}
              subjectName={currentSubject?.name || "Examination"}
              maxMarks={currentSubject?.maxMarks || 100}
              totalMarks={viewingBooklet.totalMarks}
              pages={viewingBooklet.pages || []}
              evaluatorName={currentSubject?.assignedTeacherName || "Teacher"}
              evaluatorRemarks={viewingBooklet.remarks || ""}
            />
          </div>
        </div>
      )}

      {/* Direct Override Modal */}
      {showOverrideModal && selectedMark && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleOverrideSubmit}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-black dark:text-white" />
              <span>Administrative Mark Override</span>
            </h3>

            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Adjusting score for <strong>{selectedMark.student?.fullName}</strong> ({selectedMark.student?.registerNumber}) in {currentSubject?.code}. This action is permanently recorded in the audit log.
            </p>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                New Total Marks (Max: {currentSubject?.maxMarks})
              </label>
              <input
                type="number"
                min={0}
                max={currentSubject?.maxMarks}
                required
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono text-base font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Override Justification *</label>
              <textarea
                required
                rows={3}
                placeholder="Specify regulatory reason (e.g. Committee recalculation on Question 3 discrepancy)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-opacity"
              >
                Apply Override
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
