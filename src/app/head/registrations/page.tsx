"use client";


import { Avatar } from "@/components/Avatar";
import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  Shield,
  GraduationCap,
  FileText,
  X,
  Plus,
} from "lucide-react";
import { Student } from "@/types";

const SAMPLE_COURSES = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Artificial Intelligence & Data Science",
  "B.Tech Cybersecurity & Networks",
  "B.Sc Mathematics & Computing",
  "B.Com Finance & Banking",
];

export default function HeadExamineeRosterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "2003-06-15",
    course: SAMPLE_COURSES[0],
    semester: 5,
    registerNumber: "",
    applicationNumber: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/head/registrations");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error("Failed to load students:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch("/api/head/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStudent,
          adminName: "Dr. Annie Christila S. (Head of Exam)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        setNewStudent({
          fullName: "",
          email: "",
          phone: "",
          dateOfBirth: "2003-06-15",
          course: SAMPLE_COURSES[0],
          semester: 5,
          registerNumber: "",
          applicationNumber: "",
        });
        fetchStudents();
      } else {
        alert(data.error || "Enrollment failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`Remove examinee ${name} from examination roster?`)) return;

    try {
      const res = await fetch(`/api/head/registrations?studentId=${studentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Candidate removed from examination roster.");
        fetchStudents();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (e) {
      alert("Error removing student");
    }
  };

  const handleExportCSV = () => {
    const headers = "Register Number,College ID,Full Name,Email,Phone,Course,Semester,Enrolled Date\n";
    const rows = students
      .map(
        (s) =>
          `"${s.registerNumber || ""}","${s.applicationNumber}","${s.fullName}","${s.email}","${s.phone}","${s.course}",${s.semester},"${s.approvedAt || s.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `College_Examinee_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredStudents = students.filter((s) => {
    if (courseFilter !== "all" && s.course !== courseFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) ||
      s.applicationNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <Users className="w-3.5 h-3.5" />
            <span>COLLEGE EXAMINEE DIRECTORY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Examinee Roster &amp; Registry</h1>
          <p className="text-xs text-zinc-500">
            Admitted college candidates verified for semester examinations with assigned register numbers and hall tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll College Examinee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="monochrome-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-semibold"
          >
            <option value="all">All Academic Courses ({students.length})</option>
            {SAMPLE_COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate by name, register no, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
            />
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-mono text-right">
          Total Examinees: <strong>{filteredStudents.length}</strong>
        </span>
      </div>

      {/* Examinee Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">College Roll ID</th>
                <th className="py-3.5 px-4">Programme &amp; Sem</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Hall Ticket</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No examinees found in roster.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={stu.fullName} className="w-9 h-9 rounded-full  border border-zinc-300 dark:border-zinc-700" />
                        <div>
                          <p className="font-bold text-black dark:text-white">{stu.fullName}</p>
                          <p className="text-[10px] text-zinc-500">DOB: {stu.dateOfBirth}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                      {stu.registerNumber}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                      {stu.applicationNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{stu.course}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Semester {stu.semester}</p>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <p className="text-zinc-800 dark:text-zinc-200">{stu.email}</p>
                      <p className="text-zinc-500 font-mono text-[11px]">{stu.phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        HT-{stu.registerNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(stu)}
                          title="Inspect candidate record"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(stu.id, stu.fullName)}
                          title="Remove examinee from roster"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Enroll College Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleEnrollStudent}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-black dark:text-white" />
                <span>Enroll College Student in Examination Roster</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="maya.lin@sfscollege.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Course / Programme *</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  >
                    {SAMPLE_COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Semester</label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Register Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newStudent.registerNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-[11px] text-zinc-600 dark:text-zinc-400">
                Enrolling directly creates the student's examination login credentials (default password: <code>password123</code>) and allocates a Hall Ticket.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md"
              >
                {actionLoading ? "Enrolling..." : "Enroll Examinee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidate Inspection Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="bg-black text-white p-5 flex items-center justify-between border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                  Verified Examinee Dossier
                </span>
                <h3 className="text-base font-bold text-white">{selectedStudent.fullName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <Avatar name={selectedStudent.fullName} className="w-16 h-16 rounded-2xl  border-2 border-zinc-300 dark:border-zinc-700" />
                <div className="space-y-1">
                  <p className="font-bold text-black dark:text-white text-sm">{selectedStudent.fullName}</p>
                  <p className="text-zinc-500 font-mono">
                    Register No: <strong className="text-black dark:text-white">{selectedStudent.registerNumber}</strong>
                  </p>
                  <p className="text-zinc-500 font-mono">
                    Hall Ticket: <strong className="text-black dark:text-white">HT-{selectedStudent.registerNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Degree / Programme</span>
                  <span className="font-semibold text-black dark:text-white">{selectedStudent.course}</span>
                </div>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Semester</span>
                  <span className="font-semibold text-black dark:text-white">Semester {selectedStudent.semester}</span>
                </div>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Student Email</span>
                  <span className="font-semibold text-black dark:text-white">{selectedStudent.email}</span>
                </div>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-semibold text-black dark:text-white">{selectedStudent.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 font-bold text-black dark:text-white hover:underline"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
