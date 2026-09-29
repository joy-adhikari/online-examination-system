"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FileCheck,
  Save,
  Lock,
  Eye,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AnswerBookletViewer } from "@/components/AnswerBookletViewer";

function TeacherMarksContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get("subjectId") || "";

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [currentSubject, setCurrentSubject] = useState<any | null>(null);
  const [studentsMarks, setStudentsMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Answer booklet modal
  const [inspectingBooklet, setInspectingBooklet] = useState<any | null>(null);

  // Load subjects
  useEffect(() => {
    fetch("/api/head/exams")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.subjects?.length > 0) {
          setSubjects(data.subjects);
          if (!selectedSubjectId) {
            setSelectedSubjectId(data.subjects[0].id);
          }
        }
      })
      .catch((e) => console.error("Subjects fetch error:", e));
  }, []);

  const fetchSubjectMarks = async (subjectId: string) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const sub = subjects.find((s) => s.id === subjectId);
      setCurrentSubject(sub || null);

      const [marksRes, attRes] = await Promise.all([
        fetch(`/api/marks?subjectId=${subjectId}`),
        fetch(`/api/attendance?examId=${sub?.examId || "exam_autumn2025"}&subjectId=${subjectId}`),
      ]);
      const [marksData, attData] = await Promise.all([marksRes.json(), attRes.json()]);

      const registered = attData.attendance || [];
      const existingMarks = marksData.marks || [];

      const merged = registered.map((st: any) => {
        const mark = existingMarks.find((m: any) => m.studentId === st.studentId);
        return {
          studentId: st.studentId,
          registerNumber: st.registerNumber,
          fullName: st.fullName,
          seatNumber: st.seatNumber,
          theoryMarks: mark ? mark.theoryMarks : 50,
          practicalMarks: mark ? mark.practicalMarks : 20,
          totalMarks: mark ? mark.totalMarks : 70,
          isAbsent: mark ? mark.isAbsent : st.status === "absent",
          status: mark ? mark.status : "draft",
          remarks: mark ? mark.remarks || "" : "",
        };
      });

      setStudentsMarks(merged);
    } catch (e) {
      console.error("Failed to load marks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectMarks(selectedSubjectId);
    }
  }, [selectedSubjectId, subjects]);

  const handleScoreChange = (index: number, field: "theoryMarks" | "practicalMarks" | "remarks", value: any) => {
    setStudentsMarks((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      if (field === "theoryMarks" || field === "practicalMarks") {
        const theory = Number(target.theoryMarks) || 0;
        const practical = Number(target.practicalMarks) || 0;
        target.totalMarks = target.isAbsent ? 0 : theory + practical;
      }

      next[index] = target;
      return next;
    });
  };

  const handleAbsentToggle = (index: number) => {
    setStudentsMarks((prev) => {
      const next = [...prev];
      const current = next[index];
      const nextAbsent = !current.isAbsent;
      next[index] = {
        ...current,
        isAbsent: nextAbsent,
        totalMarks: nextAbsent ? 0 : Number(current.theoryMarks) + Number(current.practicalMarks),
      };
      return next;
    });
  };

  const handleSaveMarks = async (submitAction: "draft" | "submit") => {
    if (!currentSubject) return;

    if (
      submitAction === "submit" &&
      !confirm(
        "Finalize and submit marks? This will lock further edits and trigger automatic Answer Sheet PDF generation for all candidates."
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: currentSubject.examId,
          subjectId: selectedSubjectId,
          records: studentsMarks,
          submitAction,
          evaluatedById: user?.id || "usr_teacher_santhosh",
          evaluatorName: user?.name || "Santhosh Kumar",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchSubjectMarks(selectedSubjectId);
      } else {
        alert(data.error || "Save failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInspectAnswerPaper = async (row: any) => {
    try {
      const res = await fetch(`/api/answer-papers?subjectId=${selectedSubjectId}&studentId=${row.studentId}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setInspectingBooklet({
          ...row,
          pages: data.paper.pages,
        });
      } else {
        alert("No scanned booklet uploaded by invigilator for this candidate yet.");
      }
    } catch (e) {
      alert("Failed to load paper");
    }
  };

  const isLocked = currentSubject?.marksSubmissionStatus === "submitted";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <FileCheck className="w-3.5 h-3.5" />
            <span>EXAMINEE EVALUATION GRID</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Course Grading &amp; Marks Submission</h1>
          <p className="text-xs text-zinc-500">
            Grade candidates against digitized answer scripts. Submitting locks marks and builds verified PDF bundles.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isLocked ? (
            <>
              <button
                type="button"
                onClick={() => handleSaveMarks("draft")}
                disabled={saving}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveMarks("submit")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit &amp; Lock Marks</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 text-xs font-bold font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>Submission Locked</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Unlock request submitted to Head of Examination (Dr. Annie Christila S.). You will receive an in-app notice when unlocked."
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Request Head Unlock
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subject Picker */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Assigned Subject:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name} ({sub.marksSubmissionStatus.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {currentSubject && (
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-3">
            <span>
              Max Marks: <strong className="text-black dark:text-white">{currentSubject.maxMarks}</strong>
            </span>
            <span>•</span>
            <span>
              Pass Threshold: <strong className="text-black dark:text-white">{currentSubject.passMarks}</strong>
            </span>
            <span>•</span>
            <span>
              Status: <strong className="text-black dark:text-white uppercase">{currentSubject.marksSubmissionStatus}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3.5 px-4">Seat</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4 text-center">Absent?</th>
                <th className="py-3.5 px-4 text-center">Answer Script</th>
                <th className="py-3.5 px-4 text-right">Theory (70)</th>
                <th className="py-3.5 px-4 text-right">Practical (30)</th>
                <th className="py-3.5 px-4 text-right">Total Marks</th>
                <th className="py-3.5 px-4">Evaluation Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {studentsMarks.map((row, idx) => {
                const isPassing = row.totalMarks >= (currentSubject?.passMarks || 40);
                return (
                  <tr key={row.studentId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-600 dark:text-zinc-400">{row.seatNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">{row.registerNumber}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{row.fullName}</td>

                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        disabled={isLocked}
                        checked={row.isAbsent}
                        onChange={() => handleAbsentToggle(idx)}
                        className="rounded text-black focus:ring-black"
                      />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleInspectAnswerPaper(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Script</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={70}
                        disabled={isLocked || row.isAbsent}
                        value={row.theoryMarks}
                        onChange={(e) => handleScoreChange(idx, "theoryMarks", e.target.value)}
                        className="w-16 px-2 py-1 text-right border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-black dark:text-white bg-white dark:bg-zinc-900 disabled:opacity-50 text-xs"
                      />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        disabled={isLocked || row.isAbsent}
                        value={row.practicalMarks}
                        onChange={(e) => handleScoreChange(idx, "practicalMarks", e.target.value)}
                        className="w-16 px-2 py-1 text-right border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-black dark:text-white bg-white dark:bg-zinc-900 disabled:opacity-50 text-xs"
                      />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        <span className="font-extrabold text-sm text-black dark:text-white">
                          {row.isAbsent ? "0" : row.totalMarks}
                        </span>
                        {!row.isAbsent && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPassing ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                            title={isPassing ? "Passing" : "Below pass mark"}
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        disabled={isLocked}
                        placeholder="Add remarks..."
                        value={row.remarks}
                        onChange={(e) => handleScoreChange(idx, "remarks", e.target.value)}
                        className="w-full px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white bg-white dark:bg-zinc-900 disabled:opacity-50 text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Booklet Inspector Modal */}
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
              studentName={inspectingBooklet.fullName}
              registerNumber={inspectingBooklet.registerNumber}
              course="Computer Science & Engineering"
              subjectCode={currentSubject?.code || "Subject"}
              subjectName={currentSubject?.name || "Examination"}
              maxMarks={currentSubject?.maxMarks || 100}
              totalMarks={inspectingBooklet.totalMarks}
              pages={inspectingBooklet.pages || []}
              evaluatorName={user?.name || "Santhosh Kumar"}
              evaluatorRemarks={inspectingBooklet.remarks}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherMarksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading mark entry grid...</div>}>
      <TeacherMarksContent />
    </Suspense>
  );
}
