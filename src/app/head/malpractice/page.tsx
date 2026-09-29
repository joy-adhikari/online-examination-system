"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Gavel,
} from "lucide-react";
import { MalpracticeReport } from "@/types";

export default function HeadMalpracticePage() {
  const [reports, setReports] = useState<MalpracticeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MalpracticeReport | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const [decisionForm, setDecisionForm] = useState({
    status: "action_taken",
    actionTaken: "Marks Withheld",
    headDecision: "",
  });

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/malpractice");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error("Malpractice fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch("/api/malpractice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: decisionForm.status,
          actionTaken: decisionForm.actionTaken,
          headDecision: decisionForm.headDecision.trim(),
          reviewerName: "Dr. Annie Christila S. (Dean of Examination)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Disciplinary decision recorded and candidate notification sent!");
        setShowDecisionModal(false);
        setSelectedReport(null);
        fetchReports();
      } else {
        alert(data.error || "Failed to record decision");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleOpenDecision = (r: MalpracticeReport) => {
    setSelectedReport(r);
    setDecisionForm({
      status: r.status === "reported" ? "action_taken" : r.status,
      actionTaken: r.actionTaken || "Marks Withheld",
      headDecision: r.headDecision || "",
    });
    setShowDecisionModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            <span>DISCIPLINARY OVERSIGHT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Malpractice Incident Desk</h1>
          <p className="text-xs text-zinc-500">
            Review live incident reports submitted by hall invigilators, inspect photographic evidence, and record official rulings.
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="font-bold text-black dark:text-white font-mono">Active Incidents ({reports.length} Cases Logged)</span>
          <span className="text-zinc-500 font-mono">Instant invigilator dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Case Ref</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Violation Type</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Case Status</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    No malpractice incidents logged.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">{r.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-black dark:text-white">{r.student?.fullName}</p>
                      <p className="font-mono text-[10px] text-zinc-500">{r.student?.registerNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.subject?.code}</p>
                      <p className="text-[10px] text-zinc-500">{r.subject?.name}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-rose-600 dark:text-rose-400">{r.malpracticeType}</td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">{r.reportedByName}</td>
                    <td className="py-3.5 px-4">
                      {r.evidencePhotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReport(r)}
                          className="inline-flex items-center gap-1 text-[11px] text-black dark:text-white font-bold underline hover:opacity-80"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>View Photo</span>
                        </button>
                      ) : (
                        <span className="text-zinc-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-black dark:text-white">{r.actionTaken || "Under Inquiry"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(r)}
                          title="Inspect incident statement"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDecision(r)}
                          title="Record disciplinary ruling"
                          className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] shadow-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          <Gavel className="w-3 h-3" />
                          <span>Adjudicate</span>
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

      {/* Incident Dossier Lightbox Modal */}
      {selectedReport && !showDecisionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-black dark:text-white text-base">Incident Dossier: {selectedReport.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Candidate</span>
                <span className="font-bold text-black dark:text-white">{selectedReport.student?.fullName}</span>
                <span className="font-mono text-zinc-500 block text-[11px]">{selectedReport.student?.registerNumber}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Exam &amp; Subject</span>
                <span className="font-bold text-black dark:text-white">{selectedReport.subject?.code}</span>
                <span className="text-zinc-500 block text-[11px]">{selectedReport.subject?.name}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold mb-1">Invigilator Narrative</span>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {selectedReport.description}
              </div>
            </div>

            {selectedReport.evidencePhotoUrl && (
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold mb-1">Confiscated Photo Evidence</span>
                <div className="rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 max-h-56 flex justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedReport.evidencePhotoUrl}
                    alt="Confiscated evidence"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            {selectedReport.headDecision && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-black dark:text-white">
                <span className="font-bold block text-[11px] font-mono">Head Disciplinary Ruling:</span>
                <p className="mt-0.5">{selectedReport.headDecision}</p>
                <span className="inline-block mt-1 font-bold text-xs font-mono">Action: {selectedReport.actionTaken}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setShowDecisionModal(true)}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold flex items-center gap-1.5 hover:opacity-90"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Record Ruling</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Decision Modal */}
      {showDecisionModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleDecisionSubmit}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-black dark:text-white" />
              <h3 className="font-bold text-black dark:text-white text-base">Record Disciplinary Decision</h3>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400">
              Case for candidate <strong>{selectedReport.student?.fullName}</strong> in {selectedReport.subject?.code}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Disciplinary Action Taken *</label>
                <select
                  value={decisionForm.actionTaken}
                  onChange={(e) => setDecisionForm({ ...decisionForm, actionTaken: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                >
                  <option value="Marks Withheld">Marks Withheld (Result blocked)</option>
                  <option value="Exam Cancelled">Exam Cancelled (Candidate awarded 0 marks)</option>
                  <option value="Warning Issued">Warning Issued (Marks recorded with reprimand)</option>
                  <option value="Exonerated">Exonerated (Incident dismissed, marks released)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Case Status</label>
                <select
                  value={decisionForm.status}
                  onChange={(e) => setDecisionForm({ ...decisionForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                >
                  <option value="action_taken">Action Taken (Decision active)</option>
                  <option value="under_review">Under Review (Committee inquiry continues)</option>
                  <option value="closed">Closed (Final adjudication)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Disciplinary Board Remarks *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record formal justification and Disciplinary Committee meeting findings..."
                  value={decisionForm.headDecision}
                  onChange={(e) => setDecisionForm({ ...decisionForm, headDecision: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-opacity"
              >
                Confirm Disciplinary Ruling
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
