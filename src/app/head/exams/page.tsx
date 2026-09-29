"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Calendar,
  Building2,
  Users,
  Shield,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import { Exam, Subject, Hall } from "@/types";

export default function HeadExamsPage() {
  const [examsList, setExamsList] = useState<any[]>([]);
  const [hallsList, setHallsList] = useState<Hall[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showHallModal, setShowHallModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Forms
  const [newExam, setNewExam] = useState({
    title: "",
    academicYear: "2025-2026",
    semester: 5,
    startDate: "2026-05-10",
    endDate: "2026-05-28",
    revaluationDeadline: "2026-06-15",
    revaluationFee: 25,
  });

  const [newSubject, setNewSubject] = useState({
    examId: "",
    code: "",
    name: "",
    date: "2026-05-12",
    startTime: "09:30 AM",
    endTime: "12:30 PM",
    hallId: "",
    maxMarks: 100,
    passMarks: 40,
    assignedTeacherId: "",
    assignedInvigilatorId: "",
  });

  const [newHall, setNewHall] = useState({
    name: "",
    capacity: 40,
    location: "",
  });

  const fetchData = async () => {
    try {
      const [examsRes, staffRes] = await Promise.all([
        fetch("/api/head/exams"),
        fetch("/api/head/users"),
      ]);
      const [examsData, staffData] = await Promise.all([examsRes.json(), staffRes.json()]);

      if (examsData.success) {
        setExamsList(examsData.exams || []);
        setHallsList(examsData.halls || []);
        setSubjectsList(examsData.subjects || []);
        if (examsData.exams?.length > 0 && !selectedExamId) {
          setSelectedExamId(examsData.exams[0].id);
          setNewSubject((prev) => ({ ...prev, examId: examsData.exams[0].id }));
        }
      }

      if (staffData.success) {
        setStaffUsers(staffData.users || []);
      }
    } catch (e) {
      console.error("Failed to load exams data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/head/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "exam", ...newExam }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Examination session created successfully!");
        setShowExamModal(false);
        fetchData();
      } else {
        alert(data.error || "Failed to create exam");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/head/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subject",
          ...newSubject,
          examId: newSubject.examId || selectedExamId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Subject added to timetable successfully!");
        setShowSubjectModal(false);
        setNewSubject({
          examId: selectedExamId,
          code: "",
          name: "",
          date: "2026-05-12",
          startTime: "09:30 AM",
          endTime: "12:30 PM",
          hallId: hallsList[0]?.id || "",
          maxMarks: 100,
          passMarks: 40,
          assignedTeacherId: "",
          assignedInvigilatorId: "",
        });
        fetchData();
      } else {
        alert(data.error || "Failed to add subject");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleCreateHall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/head/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "hall", ...newHall }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Examination hall created!");
        setShowHallModal(false);
        fetchData();
      } else {
        alert(data.error || "Failed to create hall");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleTogglePublish = async (examId: string, current: boolean) => {
    try {
      const res = await fetch("/api/head/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_results",
          examId,
          isResultReleased: !current,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (e) {
      alert("Error toggling result release");
    }
  };

  const currentExam = examsList.find((e) => e.id === selectedExamId) || examsList[0];
  const examSubjects = subjectsList.filter((s) => s.examId === currentExam?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SESSION ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Exams, Subjects &amp; Halls Setup</h1>
          <p className="text-xs text-zinc-500">
            Configure examination cycles, maximum marks, hall allocations, staff assignments, and release controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHallModal(true)}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Add Hall</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewSubject((prev) => ({ ...prev, examId: selectedExamId }));
              setShowSubjectModal(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExamModal(true)}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>New Exam Cycle</span>
          </button>
        </div>
      </div>

      {/* Examination Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {examsList.map((exam) => (
          <button
            key={exam.id}
            type="button"
            onClick={() => setSelectedExamId(exam.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedExamId === exam.id
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                exam.isResultReleased ? "bg-emerald-400" : "bg-zinc-400"
              }`}
            />
            <span>{exam.title}</span>
            <span className="text-[10px] opacity-75 font-mono">({exam.academicYear})</span>
          </button>
        ))}
      </div>

      {/* Selected Exam Control Card */}
      {currentExam && (
        <div className="monochrome-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    currentExam.isResultReleased
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {currentExam.isResultReleased ? "Results Published" : "Results Hidden"}
                </span>
                <span className="text-xs text-zinc-500 font-mono">Semester {currentExam.semester}</span>
              </div>
              <h2 className="text-xl font-extrabold text-black dark:text-white mt-1">{currentExam.title}</h2>
              <p className="text-xs text-zinc-500 font-mono">
                Window: {currentExam.startDate} to {currentExam.endDate}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleTogglePublish(currentExam.id, currentExam.isResultReleased)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 ${
                currentExam.isResultReleased
                  ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
              }`}
            >
              {currentExam.isResultReleased ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Withdraw Results</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Publish Results to Examinees</span>
                </>
              )}
            </button>
          </div>

          {/* Subjects Timetable Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white font-mono uppercase">
                Subjects &amp; Assigned Evaluators
              </h3>
              <span className="text-xs text-zinc-500 font-mono">{examSubjects.length} subjects in cycle</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800 font-mono">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Assigned Hall</th>
                    <th className="py-3 px-4 text-right">Max / Pass</th>
                    <th className="py-3 px-4">Teacher (Evaluator)</th>
                    <th className="py-3 px-4">Invigilator</th>
                    <th className="py-3 px-4 text-center">Marks Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                  {examSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">{sub.code}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{sub.name}</td>
                      <td className="py-3 px-4">
                        <p className="text-black dark:text-white font-medium">{sub.date}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {sub.startTime} - {sub.endTime}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-zinc-800 dark:text-zinc-200 font-medium">{sub.hallName}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-black dark:text-white">
                        {sub.maxMarks} / {sub.passMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-black dark:text-white font-medium">{sub.assignedTeacherName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{sub.assignedInvigilatorName}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                          {sub.marksSubmissionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Halls Overview */}
      <div className="monochrome-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-black dark:text-white font-mono uppercase">Physical Examination Halls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {hallsList.map((hall) => (
            <div key={hall.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black dark:text-white text-sm">{hall.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  Cap: {hall.capacity}
                </span>
              </div>
              <p className="text-zinc-500">{hall.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateExam}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base">Setup New Examination Cycle</h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Examination Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer 2026 Supplementary Examination"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={newExam.academicYear}
                    onChange={(e) => setNewExam({ ...newExam, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    value={newExam.semester}
                    onChange={(e) => setNewExam({ ...newExam, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Create Cycle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateSubject}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base">Add Subject to Timetable</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="CS308"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Cloud Computing & DevOps"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newSubject.date}
                    onChange={(e) => setNewSubject({ ...newSubject, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newSubject.startTime}
                    onChange={(e) => setNewSubject({ ...newSubject, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">End Time</label>
                  <input
                    type="text"
                    value={newSubject.endTime}
                    onChange={(e) => setNewSubject({ ...newSubject, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Exam Hall</label>
                  <select
                    value={newSubject.hallId}
                    onChange={(e) => setNewSubject({ ...newSubject, hallId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  >
                    <option value="">Select Hall</option>
                    {hallsList.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newSubject.maxMarks}
                    onChange={(e) => setNewSubject({ ...newSubject, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    value={newSubject.passMarks}
                    onChange={(e) => setNewSubject({ ...newSubject, passMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Teacher</label>
                  <select
                    value={newSubject.assignedTeacherId}
                    onChange={(e) => setNewSubject({ ...newSubject, assignedTeacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  >
                    <option value="">Select Teacher</option>
                    {staffUsers
                      .filter((u) => u.isTeacher)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Invigilator</label>
                  <select
                    value={newSubject.assignedInvigilatorId}
                    onChange={(e) => setNewSubject({ ...newSubject, assignedInvigilatorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  >
                    <option value="">Select Invigilator</option>
                    {staffUsers
                      .filter((u) => u.isInvigilator)
                      .map((iv) => (
                        <option key={iv.id} value={iv.id}>
                          {iv.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Save Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Hall Modal */}
      {showHallModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateHall}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base">Add Exam Hall</h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Hall Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hall 401 - IT Wing"
                  value={newHall.name}
                  onChange={(e) => setNewHall({ ...newHall, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  value={newHall.capacity}
                  onChange={(e) => setNewHall({ ...newHall, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Location / Block</label>
                <input
                  type="text"
                  required
                  placeholder="Block B, 3rd Floor"
                  value={newHall.location}
                  onChange={(e) => setNewHall({ ...newHall, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowHallModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Save Hall
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
