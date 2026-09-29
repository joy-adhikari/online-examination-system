"use client";

import React, { useState } from "react";
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, CheckCircle2 } from "lucide-react";
import { generateAnswerSheetBundlePDF } from "@/lib/pdf-generator";

interface AnswerBookletViewerProps {
  studentName: string;
  registerNumber: string;
  course: string;
  subjectCode: string;
  subjectName: string;
  maxMarks: number;
  totalMarks: number;
  evaluatorName?: string;
  evaluatorRemarks?: string;
  pages: string[];
  allowDownload?: boolean;
}

export function AnswerBookletViewer({
  studentName,
  registerNumber,
  course,
  subjectCode,
  subjectName,
  maxMarks,
  totalMarks,
  evaluatorName = "Santhosh Kumar",
  evaluatorRemarks = "Official evaluation completed.",
  pages = [],
  allowDownload = true,
}: AnswerBookletViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!pages || pages.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
        <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-black dark:text-white">No Answer Script Scans Uploaded Yet</p>
        <p className="text-xs text-zinc-500 mt-1">
          The invigilator has not uploaded the physical answer booklet scan for this candidate.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    generateAnswerSheetBundlePDF({
      studentName,
      registerNumber,
      course,
      subjectCode,
      subjectName,
      maxMarks,
      totalMarks,
      evaluatorName,
      evaluatorRemarks,
      pages,
    });
  };

  return (
    <div className="bg-black text-white rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Viewer Toolbar */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-black bg-white px-2.5 py-0.5 rounded uppercase tracking-wider">
            Script Archive
          </span>
          <div className="text-xs font-mono">
            <span className="font-bold text-white">{subjectCode}</span>
            <span className="text-zinc-500 mx-1.5">•</span>
            <span className="text-zinc-300">{studentName}</span>
            <span className="text-zinc-500 mx-1.5">({registerNumber})</span>
          </div>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-zinc-200 text-[11px]">
              Page {currentPage + 1} / {pages.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={currentPage === pages.length - 1}
              className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-zinc-400">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {allowDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Bundle</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="p-4 sm:p-8 bg-zinc-950/90 overflow-auto flex justify-center min-h-[500px] max-h-[650px]">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-150 relative shadow-2xl rounded-lg overflow-hidden bg-white max-w-[620px] w-full"
        >
          {pages[currentPage].startsWith("data:image/svg+xml") ||
          pages[currentPage].startsWith("http") ||
          pages[currentPage].startsWith("data:image/") ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={pages[currentPage]}
              alt={`Answer booklet page ${currentPage + 1}`}
              className="w-full h-auto object-contain select-none"
            />
          ) : (
            <div className="p-12 text-center text-zinc-800">
              <p className="font-mono text-sm">Scan Reference: {pages[currentPage]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Banner */}
      <div className="px-4 py-2.5 bg-black border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Verified Examination Script • Evaluated Score:{" "}
            <strong className="text-white">
              {totalMarks} / {maxMarks}
            </strong>
          </span>
        </div>
        <div className="text-[11px] text-zinc-500">Audit ID: {subjectCode}-VERIFIED</div>
      </div>
    </div>
  );
}
