"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { compressImage } from "@/lib/image";
import {
  Camera,
  Upload,
  Trash2,
  ArrowLeft,
  Save,
  Sparkles,
} from "lucide-react";

export default function InvigilatorPapersPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [currentPages, setCurrentPages] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/attendance?examId=exam_autumn2025&subjectId=subj_cs301")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.attendance?.length > 0) {
          setCandidates(data.attendance);
          setSelectedStudentId(data.attendance[0].studentId);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const fetchStudentPaper = async (studentId: string) => {
    try {
      const res = await fetch(`/api/answer-papers?subjectId=subj_cs301&studentId=${studentId}`);
      const data = await res.json();
      if (data.success && data.paper) {
        setCurrentPages(data.paper.pages || []);
        setNotes(data.paper.notes || "");
      } else {
        setCurrentPages([]);
        setNotes("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentPaper(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        setCurrentPages((prev) => [...prev, compressed]);
      } catch (err: any) {
        alert(`${file.name}: ${err.message}`);
      }
    }
  };

  const handleAddSamplePages = () => {
    const candidate = candidates.find((c) => c.studentId === selectedStudentId);
    const candidateName = candidate?.fullName || "Student";
    const regNo = candidate?.registerNumber || "U03ZW25S0000";

    const createSampleSvg = (pNum: number) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
        <rect width="600" height="850" fill="#09090b" stroke="#27272a" stroke-width="2"/>
        <rect x="20" y="20" width="560" height="80" fill="#18181b" stroke="#3f3f46" rx="6"/>
        <text x="300" y="48" font-family="monospace" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">SFS COLLEGE EXAMINATION BOARD</text>
        <text x="300" y="68" font-family="sans-serif" font-size="11" fill="#a1a1aa" text-anchor="middle">Official Answer Booklet • Page ${pNum} of 3</text>
        <line x1="20" y1="80" x2="580" y2="80" stroke="#27272a"/>
        <text x="35" y="98" font-family="monospace" font-size="11" fill="#e4e4e7">Candidate: ${candidateName} (${regNo})</text>
        
        <g stroke="#27272a" stroke-width="1">
          <line x1="70" y1="110" x2="70" y2="810" stroke="#52525b" stroke-width="1.5" />
          ${Array.from({ length: 24 }).map((_, i) => `<line x1="20" y1="${140 + i * 28}" x2="580" y2="${140 + i * 28}" />`).join("")}
        </g>
        <text x="35" y="140" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Ans ${pNum}</text>
        <text x="85" y="140" font-family="sans-serif" font-size="13" fill="#ffffff" font-weight="bold">Database Query Processing &amp; Execution Cost</text>
        <text x="85" y="168" font-family="sans-serif" font-size="12" fill="#d4d4d8">Cost Estimation Model: C = B(R) + (I/O block access time) * seek latency.</text>
        <text x="85" y="196" font-family="sans-serif" font-size="12" fill="#d4d4d8">Evaluation algorithms for joins include Block Nested-Loop Join and Hash Join.</text>
      </svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    setCurrentPages((prev) => [
      ...prev,
      createSampleSvg(prev.length + 1),
    ]);
  };

  const handleRemovePage = (index: number) => {
    setCurrentPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBooklet = async () => {
    if (!selectedStudentId || currentPages.length === 0) {
      alert("Please capture or upload at least one page.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/answer-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: "exam_autumn2025",
          subjectId: "subj_cs301",
          studentId: selectedStudentId,
          pages: currentPages,
          notes: notes.trim(),
          uploadedById: user?.id || "usr_staff_sailaja",
          uploaderName: user?.name || "Dr. Sailaja Mulakaluri",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Answer booklet uploaded and securely cataloged!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.studentId === selectedStudentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/invigilator"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hall Ops
          </Link>
          <h1 className="text-2xl font-extrabold text-black dark:text-white">Answer Paper Digitization</h1>
          <p className="text-xs text-zinc-500">Capture or upload physical student answer scripts page-by-page.</p>
        </div>

        <button
          type="button"
          onClick={handleSaveBooklet}
          disabled={saving || currentPages.length === 0}
          className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 font-bold text-xs shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Cataloging..." : `Save Script (${currentPages.length} Pages)`}</span>
        </button>
      </div>

      {/* Candidate Picker Bar */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider">Candidate:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold"
          >
            {candidates.map((c) => (
              <option key={c.studentId} value={c.studentId}>
                Seat {c.seatNumber}: {c.fullName} ({c.registerNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedCandidate && (
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span>Seat: <strong className="text-black dark:text-white">{selectedCandidate.seatNumber}</strong></span>
            <span>•</span>
            <span>Reg: <strong className="text-black dark:text-white font-mono">{selectedCandidate.registerNumber}</strong></span>
          </div>
        )}
      </div>

      {/* Capture Actions Toolbar */}
      <div className="bg-black text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-md border border-zinc-800">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm">Capture Physical Script</h3>
          <p className="text-xs text-zinc-400">Use device camera or upload image files</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors">
            <Camera className="w-4 h-4" />
            <span>Camera Scan</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleAddSamplePages}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Sample Page</span>
          </button>
        </div>
      </div>

      {/* Pages Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-black dark:text-white uppercase">
          <span>Script Scans ({currentPages.length} Pages Attached)</span>
        </div>

        {currentPages.length === 0 ? (
          <div className="monochrome-card rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center space-y-2">
            <Camera className="w-10 h-10 text-zinc-400 mx-auto" />
            <p className="font-bold text-black dark:text-white text-sm">No Scanned Pages Attached</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Tap "Camera Scan" on your mobile device or click "Add Sample Page" to simulate captured booklets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentPages.map((pageData, idx) => (
              <div
                key={idx}
                className="monochrome-card rounded-2xl overflow-hidden shadow-xs relative group flex flex-col justify-between"
              >
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-black dark:text-white">Page {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePage(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    title="Remove page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 flex justify-center bg-zinc-900 aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pageData}
                    alt={`Booklet page ${idx + 1}`}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invigilator Notes on Physical Script */}
      <div className="monochrome-card rounded-2xl p-4 space-y-2 text-xs">
        <label className="block font-bold text-black dark:text-white font-mono uppercase">Invigilator Observations</label>
        <input
          type="text"
          placeholder="e.g. 3 main booklets verified and bound."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
        />
      </div>
    </div>
  );
}
