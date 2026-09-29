"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AuditLogItem } from "@/types";

export default function HeadAuditReportsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs?limit=150");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Audit logs fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportAuditLogs = () => {
    const headers = "Log ID,Action,Actor,Entity Type,Entity ID,Details,Timestamp\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.action}","${l.userName}","${l.entityType}","${l.entityId}","${l.details.replace(/"/g, '""')}","${l.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Examination_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportMalpracticeRegister = async () => {
    try {
      const res = await fetch("/api/malpractice");
      const data = await res.json();
      if (!data.success) return alert("Failed to fetch data");

      const headers = "Case ID,Register No,Student Name,Subject Code,Malpractice Type,Reporter,Status,Action Taken,Decision\n";
      const rows = (data.reports || [])
        .map(
          (r: any) =>
            `"${r.id}","${r.student?.registerNumber || ""}","${r.student?.fullName || ""}","${r.subject?.code || ""}","${r.malpracticeType}","${r.reportedByName || ""}","${r.status}","${r.actionTaken || ""}","${(r.headDecision || "").replace(/"/g, '""')}"`
        )
        .join("\n");

      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Malpractice_Register_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (e) {
      alert("Export failed");
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <Shield className="w-3.5 h-3.5" />
            <span>IMMUTABLE EVENT LOG</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Audit Trail &amp; Export Center</h1>
          <p className="text-xs text-zinc-500">
            Every critical action (mark modification, result publication, attendance, malpractice) is timestamped and recorded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportMalpracticeRegister}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Malpractice Register (CSV)</span>
          </button>
          <button
            type="button"
            onClick={handleExportAuditLogs}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold font-mono"
          >
            <option value="all">All Actions ({logs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, action, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
            />
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-mono text-right">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Logs Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Audit Statement / Particulars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-black dark:text-white">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {log.entityType}:{log.entityId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-lg">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
