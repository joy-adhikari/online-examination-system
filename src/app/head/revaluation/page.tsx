"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  User,
  Eye,
  Settings,
  ArrowRight,
  Download,
} from "lucide-react";
import { RevaluationRequest } from "@/types";

export default function HeadRevaluationPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assignedTeacherId: "",
    headRemarks: "",
  });

  const fetchData = async () => {
    try {
      const [revalRes, staffRes] = await Promise.all([
        fetch("/api/revaluation"),
        fetch("/api/head/users"),
      ]);
      const [revalData, staffData] = await Promise.all([revalRes.json(), staffRes.json()]);

      if (revalData.success) {
        setRequests(revalData.requests || []);
      }
      if (staffData.success) {
        setStaffUsers((staffData.users || []).filter((u: any) => u.isTeacher));
      }
    } catch (e) {
      console.error("Failed to load revaluation:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const res = await fetch("/api/revaluation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: "head_assign",
          assignedTeacherId: assignForm.assignedTeacherId,
          headRemarks: assignForm.headRemarks.trim() || "Approved for senior reassessment.",
          actorName: "Dr. Annie Christila S. (Dean of Exam)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Revaluation appeal approved and assigned to evaluator.");
        setShowAssignModal(false);
        setSelectedReq(null);
        fetchData();
      } else {
        alert(data.error || "Assignment failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleRejectAppeal = async (reqItem: any) => {
    const reason = prompt(`Enter reason for rejecting revaluation appeal for ${reqItem.student?.fullName}:`, "Candidate score has exceeded multiple rounds of standard rubric verification.");
    if (!reason) return;

    try {
      const res = await fetch("/api/revaluation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: reqItem.id,
          action: "head_reject",
          headRemarks: reason,
          actorName: "Dr. Annie Christila S.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Revaluation appeal rejected. Candidate notified.");
        fetchData();
      } else {
        alert(data.error || "Rejection failed");
      }
    } catch (e) {
      alert("Error rejecting appeal");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RE-ASSESSMENT &amp; APPEALS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Revaluation Appeals Desk</h1>
          <p className="text-xs text-zinc-500">
            Review examinee grade appeals, assign designated faculty evaluators, and verify revised scores.
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-black dark:text-white">Active Appeals ({requests.length})</span>
          <span className="text-zinc-500">Authorized evaluator double-check</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Appeal ID</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-right">Original Score</th>
                <th className="py-3 px-4 text-right">Revised Score</th>
                <th className="py-3 px-4">Assigned Evaluator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No revaluation appeals submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
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
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {r.originalMarks} / {r.subject?.maxMarks || 100}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                      {r.revisedMarks !== null && r.revisedMarks !== undefined ? (
                        <span className="text-black dark:text-white">{r.revisedMarks}</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{r.assignedTeacherName || "Unassigned"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReq(r)}
                          title="Inspect appeal reasoning"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {r.status === "applied" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReq(r);
                                setAssignForm({
                                  assignedTeacherId: staffUsers[0]?.id || "",
                                  headRemarks: "Approved for senior reassessment.",
                                });
                                setShowAssignModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] shadow-xs flex items-center gap-1 hover:opacity-90"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Assign</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectAppeal(r)}
                              className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appeal Details Modal */}
      {selectedReq && !showAssignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-black dark:text-white text-base">Revaluation Appeal Dossier</h3>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Candidate</span>
                <span className="font-bold text-black dark:text-white">{selectedReq.student?.fullName}</span>
                <span className="font-mono text-zinc-500 block text-[11px]">{selectedReq.student?.registerNumber}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Subject Code</span>
                <span className="font-bold text-black dark:text-white">{selectedReq.subject?.code}</span>
                <span className="text-zinc-500 block text-[11px]">{selectedReq.subject?.name}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Original Marks</span>
                <span className="font-mono font-bold text-black dark:text-white text-sm">{selectedReq.originalMarks}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Revised Marks</span>
                <span className="font-mono font-bold text-black dark:text-white text-sm">
                  {selectedReq.revisedMarks !== null ? selectedReq.revisedMarks : "Pending Evaluation"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold mb-1">Candidate Justification</span>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                "{selectedReq.reason}"
              </div>
            </div>

            {selectedReq.teacherRemarks && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-black dark:text-white">
                <span className="font-bold block text-[11px] font-mono">Evaluator Remarks:</span>
                <p className="mt-0.5">{selectedReq.teacherRemarks}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Close
              </button>
              {selectedReq.status === "applied" && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-opacity"
                >
                  Approve &amp; Assign Evaluator
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAssignSubmit}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base">Assign Revaluation Evaluator</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Assign a senior faculty member to re-assess <strong>{selectedReq.student?.fullName}</strong>'s answer script for {selectedReq.subject?.code}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select Evaluator *</label>
                <select
                  required
                  value={assignForm.assignedTeacherId}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedTeacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                >
                  <option value="">Select Faculty Member</option>
                  {staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Head Instructions / Remarks</label>
                <textarea
                  rows={2}
                  value={assignForm.headRemarks}
                  onChange={(e) => setAssignForm({ ...assignForm, headRemarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-opacity"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
