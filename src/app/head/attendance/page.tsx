"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Users,
  Search,
} from "lucide-react";

export default function HeadAttendancePage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/head/exams")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.exams?.length > 0) {
          setExams(data.exams);
          setSubjects(data.subjects || []);
          const firstExam = data.exams[0];
          setSelectedExamId(firstExam.id);
          const firstSubj = data.subjects?.find((s: any) => s.examId === firstExam.id);
          if (firstSubj) setSelectedSubjectId(firstSubj.id);
        }
      })
      .catch((e) => console.error("Exams fetch error:", e));
  }, []);

  const fetchAttendance = async (examId: string, subjectId: string) => {
    if (!examId || !subjectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?examId=${examId}&subjectId=${subjectId}`);
      const data = await res.json();
      if (data.success) {
        setAttendanceRecords(data.attendance || []);
      }
    } catch (e) {
      console.error("Attendance fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId && selectedSubjectId) {
      fetchAttendance(selectedExamId, selectedSubjectId);
    }
  }, [selectedExamId, selectedSubjectId]);

  const handleExportCSV = () => {
    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
    const headers = "Register No,Seat No,Candidate Name,Course,Attendance Status,Notes\n";
    const rows = attendanceRecords
      .map(
        (a) =>
          `"${a.registerNumber || ""}","${a.seatNumber}","${a.fullName}","${a.course}","${a.status}","${a.notes || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${currentSubject?.code || "Subject"}_Export.csv`;
    a.click();
  };

  const currentExamSubjects = subjects.filter((s) => s.examId === selectedExamId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const stats = {
    present: attendanceRecords.filter((a) => a.status === "present").length,
    absent: attendanceRecords.filter((a) => a.status === "absent").length,
    late: attendanceRecords.filter((a) => a.status === "late").length,
    total: attendanceRecords.length,
  };

  const filtered = attendanceRecords.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      (a.registerNumber && a.registerNumber.toLowerCase().includes(q)) ||
      a.seatNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <Clock className="w-3.5 h-3.5" />
            <span>REAL-TIME PROCTORING</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Live Hall Attendance Monitor</h1>
          <p className="text-xs text-zinc-500">
            Track examinee presence, absentees, and invigilator hall verification logs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Attendance (CSV)</span>
        </button>
      </div>

      {/* Selectors & Filters */}
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

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="monochrome-card p-4 rounded-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Total Candidates</span>
          <p className="text-xl font-bold font-mono text-black dark:text-white mt-0.5">{stats.total}</p>
        </div>
        <div className="monochrome-card p-4 rounded-xl border-emerald-500/30">
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400">Present</span>
          <p className="text-xl font-bold font-mono text-black dark:text-white mt-0.5">{stats.present}</p>
        </div>
        <div className="monochrome-card p-4 rounded-xl border-rose-500/30">
          <span className="text-[10px] uppercase font-mono font-bold text-rose-600 dark:text-rose-400">Absent</span>
          <p className="text-xl font-bold font-mono text-black dark:text-white mt-0.5">{stats.absent}</p>
        </div>
        <div className="monochrome-card p-4 rounded-xl border-amber-500/30">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-600 dark:text-amber-400">Late Arrivals</span>
          <p className="text-xl font-bold font-mono text-black dark:text-white mt-0.5">{stats.late}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-black dark:text-white">{currentSubject?.name}</span>
            <span className="text-zinc-400 mx-2">•</span>
            <span className="font-mono text-zinc-600 dark:text-zinc-400">Hall: {currentSubject?.hallName || "Hall 101"}</span>
          </div>
          <span className="text-zinc-500 font-mono">Invigilator: {currentSubject?.assignedInvigilatorName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                <th className="py-3 px-4">Seat</th>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Invigilator Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((rec) => (
                <tr key={rec.studentId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">{rec.seatNumber}</td>
                  <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">{rec.registerNumber}</td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{rec.fullName}</td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{rec.course}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                      {rec.status === "present" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {rec.status === "absent" && <XCircle className="w-3 h-3 text-rose-500" />}
                      {rec.status === "late" && <Clock className="w-3 h-3 text-amber-500" />}
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-500 italic">{rec.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
