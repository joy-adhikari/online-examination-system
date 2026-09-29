"use client";


import { Avatar } from "@/components/Avatar";
import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  ClipboardList,
  Camera,
  Edit2,
} from "lucide-react";

export default function HeadUsersPage() {
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    isTeacher: true,
    isInvigilator: false,
    password: "password123",
  });

  const [editForm, setEditForm] = useState({
    isTeacher: false,
    isInvigilator: false,
    status: "active",
    newPassword: "",
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/head/users");
      const data = await res.json();
      if (data.success) {
        setStaffUsers(data.users || []);
      }
    } catch (e) {
      console.error("Staff fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/head/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff user account created successfully!");
        setShowAddModal(false);
        setNewStaff({
          name: "",
          email: "",
          username: "",
          phone: "",
          isTeacher: true,
          isInvigilator: false,
          password: "password123",
        });
        fetchStaff();
      } else {
        alert(data.error || "Failed to create staff member");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleEditOpen = (u: any) => {
    setSelectedUser(u);
    setEditForm({
      isTeacher: u.isTeacher,
      isInvigilator: u.isInvigilator,
      status: u.status,
      newPassword: "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch("/api/head/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          isTeacher: editForm.isTeacher,
          isInvigilator: editForm.isInvigilator,
          status: editForm.status,
          password: editForm.newPassword ? editForm.newPassword : undefined,
          adminName: "Dr. Annie Christila S.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff permissions and status updated!");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchStaff();
      } else {
        alert(data.error || "Failed to update staff member");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleAdminResetPassword = async (user: any) => {
    const newPass = prompt(`Set new password for ${user.name} (${user.username}):`, "password123");
    if (!newPass) return;

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPass,
          adminInitiated: true,
          requesterName: "Dr. Annie Christila S. (Head of Exam)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Password for ${user.username} has been reset to: ${newPass}`);
      } else {
        alert(data.error || "Password reset failed");
      }
    } catch (e) {
      alert("Error resetting password");
    }
  };

  const filteredStaff = staffUsers.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-black dark:text-white font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
            <Shield className="w-3.5 h-3.5" />
            <span>PERSONNEL &amp; ROLES</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white mt-1">Staff Management Console</h1>
          <p className="text-xs text-zinc-500">
            Configure Faculty Evaluator &amp; Hall Invigilator accounts, permissions, and credential resets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="monochrome-card rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
          />
        </div>
        <div className="text-xs text-zinc-500 font-mono hidden sm:block">
          Active Staff: <strong>{staffUsers.length}</strong>
        </div>
      </div>

      {/* Staff Table */}
      <div className="monochrome-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Assignments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredStaff.map((u) => {
                const isDual = u.isTeacher && u.isInvigilator;
                return (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} className="w-9 h-9 rounded-full  border border-zinc-300 dark:border-zinc-700" />
                        <div>
                          <p className="font-bold text-black dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-zinc-500 capitalize">{u.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">{u.username}</td>

                    <td className="py-3.5 px-4">
                      <p className="text-zinc-800 dark:text-zinc-200">{u.email}</p>
                      <p className="text-zinc-500 text-[10px] font-mono">{u.phone || "No phone listed"}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.role === "head" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
                            Super Admin (Head)
                          </span>
                        ) : (
                          <>
                            {u.isTeacher && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                                <ClipboardList className="w-3 h-3" /> Teacher
                              </span>
                            )}
                            {u.isInvigilator && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                                <Camera className="w-3 h-3" /> Invigilator
                              </span>
                            )}
                            {isDual && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono uppercase bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white">
                                Dual
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-black dark:text-white font-mono">
                        {u.teacherSubjectsCount || 0} evaluated subjects
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {u.invigilatorSubjectsCount || 0} proctored subjects
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-mono ${
                          u.status === "active"
                            ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700"
                            : "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {u.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditOpen(u)}
                          title="Edit staff role and status"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminResetPassword(u)}
                          title="Head-initiated password reset"
                          className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              <span>Create Staff Account</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Catherine Lee"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="catherine.lee@sfscollege.edu"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="catherine_lee"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>

              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider font-mono">
                  Assigned Operational Permissions
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.isTeacher}
                    onChange={(e) => setNewStaff({ ...newStaff, isTeacher: e.target.checked })}
                    className="rounded text-black focus:ring-black"
                  />
                  <div>
                    <span className="font-bold text-black dark:text-white">Teacher / Evaluator</span>
                    <p className="text-[10px] text-zinc-500">Grade scripts, submit marks, evaluate revaluations</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStaff.isInvigilator}
                    onChange={(e) => setNewStaff({ ...newStaff, isInvigilator: e.target.checked })}
                    className="rounded text-black focus:ring-black"
                  />
                  <div>
                    <span className="font-bold text-black dark:text-white">Hall Invigilator</span>
                    <p className="text-[10px] text-zinc-500">Mark attendance, capture scripts, report malpractice</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Initial Password</label>
                <input
                  type="text"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                />
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
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              <span>Edit Staff: {selectedUser.name}</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider font-mono">
                  Update Permissions
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isTeacher}
                    onChange={(e) => setEditForm({ ...editForm, isTeacher: e.target.checked })}
                    className="rounded text-black focus:ring-black"
                  />
                  <span className="font-bold text-black dark:text-white">Teacher / Evaluator</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isInvigilator}
                    onChange={(e) => setEditForm({ ...editForm, isInvigilator: e.target.checked })}
                    className="rounded text-black focus:ring-black"
                  />
                  <span className="font-bold text-black dark:text-white">Hall Invigilator</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="suspended">Suspended (Access Blocked)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Reset Password (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to preserve current"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
