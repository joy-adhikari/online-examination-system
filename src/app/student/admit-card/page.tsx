"use client";


import { Avatar } from "@/components/Avatar";
import React, { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Printer,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function StudentAdmitCardPage() {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const studentName = user?.student?.fullName || user?.name || "Joy Adhikari";
  const registerNumber = user?.student?.registerNumber || user?.username || "U03ZW25S0092";
  const course = user?.student?.course || "B.Tech Computer Science & Engineering";
  const semester = user?.student?.semester || 5;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Home
          </Link>
          <h1 className="text-2xl font-extrabold text-black dark:text-white">Examination Hall Ticket</h1>
          <p className="text-xs text-zinc-500">
            Admit card for Semester End Examinations. Must be presented at the examination hall entrance.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Printable Hall Ticket Document */}
      <div
        ref={printRef}
        className="monochrome-card rounded-2xl border-2 border-zinc-900 dark:border-zinc-700 p-6 sm:p-10 space-y-6 text-black dark:text-white print:border-none print:shadow-none print:p-0"
      >
        {/* Institutional Header */}
        <div className="text-center border-b-2 border-zinc-900 dark:border-zinc-700 pb-4 space-y-1">
          <div className="flex items-center justify-center gap-2 font-mono font-extrabold text-lg sm:text-2xl tracking-tight text-black dark:text-white">
            <span className="w-7 h-7 bg-black text-white dark:bg-white dark:text-black rounded flex items-center justify-center text-xs">
              EX
            </span>
            <span>SFS COLLEGE EXAMINATION BOARD</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-mono">
            OFFICIAL ADMIT CARD &amp; HALL TICKET • AUTUMN 2025
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">
            Dean of Examinations | Security Verification Ref: HT-2025-{registerNumber}
          </p>
        </div>

        {/* Candidate Particulars & Photo */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="space-y-2 text-xs flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Candidate Name</span>
                <span className="text-base font-extrabold text-black dark:text-white uppercase">{studentName}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Register Number</span>
                <span className="text-base font-extrabold font-mono text-black dark:text-white">{registerNumber}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Degree / Programme</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{course}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Semester</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">Semester {semester}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Allocated Hall</span>
                <span className="font-bold text-black dark:text-white">Hall 101 - Main Academic Block</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">Designated Seat</span>
                <span className="font-extrabold font-mono text-black dark:text-white text-sm">Seat A-12</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <Avatar name={studentName} className="w-24 h-28  rounded-lg border-2 border-zinc-400 shadow-sm" />
            <span className="text-[10px] font-mono text-zinc-400">Verified Photo</span>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Authorized Exam Timetable
          </h3>
          <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-2.5 px-3">Sub Code</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Exam Date</th>
                <th className="py-2.5 px-3">Session Timing</th>
                <th className="py-2.5 px-3 text-center">Invigilator Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold">CS301</td>
                <td className="py-2.5 px-3 font-medium">Database Management Systems</td>
                <td className="py-2.5 px-3 font-mono">Nov 12, 2025</td>
                <td className="py-2.5 px-3 font-mono">09:30 AM - 12:30 PM</td>
                <td className="py-2.5 px-3 text-center font-serif text-zinc-400 italic">[Verified]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold">CS302</td>
                <td className="py-2.5 px-3 font-medium">Compiler Design &amp; Automata Theory</td>
                <td className="py-2.5 px-3 font-mono">Nov 15, 2025</td>
                <td className="py-2.5 px-3 font-mono">09:30 AM - 12:30 PM</td>
                <td className="py-2.5 px-3 text-center font-serif text-zinc-400 italic">[Verified]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold">CS303</td>
                <td className="py-2.5 px-3 font-medium">Computer Networks &amp; Distributed Protocols</td>
                <td className="py-2.5 px-3 font-mono">Nov 18, 2025</td>
                <td className="py-2.5 px-3 font-mono">09:30 AM - 12:30 PM</td>
                <td className="py-2.5 px-3 text-center font-serif text-zinc-400 italic">[Verified]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold">CS304</td>
                <td className="py-2.5 px-3 font-medium">Software Engineering &amp; Agile Methodologies</td>
                <td className="py-2.5 px-3 font-mono">Nov 21, 2025</td>
                <td className="py-2.5 px-3 font-mono">02:00 PM - 05:00 PM</td>
                <td className="py-2.5 px-3 text-center font-serif text-zinc-400 italic">[Verified]</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          <p className="font-bold text-black dark:text-white uppercase font-mono">Candidate Instructions:</p>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>Candidates must occupy their assigned seats at least 15 minutes prior to commencement.</li>
            <li>No candidate will be admitted into the examination hall after 30 minutes of session commencement.</li>
            <li>Mobile devices, calculators, smartwatches, or unauthorized materials are strictly prohibited.</li>
            <li>Possession of chits or unauthorized aids results in immediate malpractice reporting and result withholding.</li>
          </ol>
        </div>

        {/* Signatures & Barcode */}
        <div className="pt-6 flex items-end justify-between border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="space-y-1">
            <div className="w-36 h-8 bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] flex items-center justify-center tracking-widest font-bold">
              ||| |||| | ||||| ||||
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">ID: {registerNumber}-2025</p>
          </div>

          <div className="text-center space-y-1">
            <div className="border-b border-zinc-400 w-40 pb-1">
              <span className="font-serif italic text-black dark:text-white font-bold">Annie Christila</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase font-mono">
              Controller of Examinations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
