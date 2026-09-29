"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { compressImage } from "@/lib/image";
import {
  AlertOctagon,
  Camera,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";

const MALPRACTICE_TYPES = [
  "Possession of Unauthorized Material",
  "Mobile Phone / Smartwatch Usage",
  "Copying / Communicating with Candidates",
  "Impersonation",
  "Disruptive / Threatening Behavior",
  "Tampering with Answer Booklet Seals",
];

export default function InvigilatorMalpracticePage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    malpracticeType: MALPRACTICE_TYPES[0],
    description: "",
    evidencePhotoUrl: "",
  });

  useEffect(() => {
    fetch("/api/attendance?examId=exam_autumn2025&subjectId=subj_cs301")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.attendance?.length > 0) {
          setCandidates(data.attendance);
          setForm((prev) => ({ ...prev, studentId: data.attendance[0].studentId }));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 0.7);
      setForm((prev) => ({ ...prev, evidencePhotoUrl: compressed }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.description.trim()) {
      alert("Please select candidate and provide detailed incident narrative.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/malpractice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: "exam_autumn2025",
          subjectId: "subj_cs301",
          studentId: form.studentId,
          reportedById: user?.id || "usr_staff_sailaja",
          reporterName: user?.name || "Dr. Sailaja Mulakaluri",
          malpracticeType: form.malpracticeType,
          description: form.description.trim(),
          evidencePhotoUrl: form.evidencePhotoUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.error || "Failed to submit report");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <Link
          href="/invigilator"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hall Ops
        </Link>
        <h1 className="text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-500" />
          <span>Report Malpractice Incident</span>
        </h1>
        <p className="text-xs text-zinc-500">
          This report is dispatched with highest priority to the Head of Examination and automatically flags the candidate result as withheld.
        </p>
      </div>

      {success ? (
        <div className="monochrome-card rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-full flex items-center justify-center mx-auto border border-zinc-300 dark:border-zinc-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-black dark:text-white">Incident Report Dispatched</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            The malpractice statement and photographic evidence have been transmitted to Dr. Annie Christila S. (Dean of Examination). The candidate's examination result for this subject has been flagged as <strong>WITHHELD</strong> pending committee inquiry.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/invigilator"
              className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Return to Hall Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setForm({
                  studentId: candidates[0]?.studentId || "",
                  malpracticeType: MALPRACTICE_TYPES[0],
                  description: "",
                  evidencePhotoUrl: "",
                });
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Log Another Incident
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="monochrome-card rounded-2xl p-6 space-y-5 text-xs">
          {/* Candidate Selection */}
          <div className="space-y-1">
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 font-mono uppercase">
              Select Involved Candidate *
            </label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold text-xs"
            >
              {candidates.map((c) => (
                <option key={c.studentId} value={c.studentId}>
                  Seat {c.seatNumber}: {c.fullName} ({c.registerNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Violation Category */}
          <div className="space-y-1">
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 font-mono uppercase">
              Malpractice Violation Category *
            </label>
            <select
              value={form.malpracticeType}
              onChange={(e) => setForm({ ...form, malpracticeType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs"
            >
              {MALPRACTICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Narrative Statement */}
          <div className="space-y-1">
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 font-mono uppercase">
              Detailed Invigilator Incident Narrative *
            </label>
            <textarea
              required
              rows={4}
              placeholder="State precise time, observations, confiscated items, and actions taken (e.g. At 10:45 AM candidate was observed retrieving notes hidden in desk compartment...)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs leading-relaxed"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 font-mono uppercase">
              Confiscated Photo Evidence
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              {form.evidencePhotoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={form.evidencePhotoUrl}
                  alt="Evidence"
                  className="w-24 h-24 object-cover rounded-xl border border-zinc-400 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-zinc-400" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <p className="text-[11px] text-zinc-500">
                  Photograph confiscated material, device, or paper. Supported format: JPG / PNG.
                </p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] inline-flex items-center gap-1 hover:opacity-90">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Evidence Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleEvidenceUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-black dark:text-white text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>
              Submitting creates an immutable audit record. The Examination Board is notified immediately.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Transmitting Report..." : "Submit Incident Report to Head of Examination"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
