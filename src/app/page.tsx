"use client";


import { Avatar } from "@/components/Avatar";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThreeExaminationCanvas } from "@/components/ThreeExaminationCanvas";
import {
  Shield,
  FileCheck,
  ClipboardList,
  AlertOctagon,
  Award,
  Users,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  Camera,
  Layers,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const { user, activeRole, switchDemoUser } = useAuth();
  const [stats, setStats] = useState({
    activeExams: 2,
    enrolledStudents: 7,
    openMalpractice: 1,
    pendingRevaluation: 1,
  });

  useEffect(() => {
    fetch("/api/head/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) {
          setStats((prev) => ({ ...prev, activeExams: data.exams.length }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 3D Hero Section in Monochrome */}
      <section className="relative overflow-hidden bg-black text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>SFS COLLEGE • ELECTRONICS CITY, BENGALURU</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              SFS College{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600">
                Examination Management
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Official examination workflow for SFS College — led by Dr. Annie Christila S. with faculty evaluators
              Santhosh Kumar, Dr. Sailaja Mulakaluri and Mr. Akhil Kumar K M. Verified attendance, digital script capture,
              locked mark submissions, and result publication.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={user ? (activeRole ? `/${activeRole}` : "/head") : "/login"}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm shadow-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <span>{user ? `Enter Active Portal (${user.role.toUpperCase()})` : "Enter Examination Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/results"
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-zinc-400" />
                <span>Verify Published Results</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800 text-xs font-mono text-zinc-400">
              <div>
                <span className="block text-white font-bold text-lg">100%</span>
                <span>Proctored Verification</span>
              </div>
              <div>
                <span className="block text-white font-bold text-lg">Double-Lock</span>
                <span>Grading Integrity</span>
              </div>
              <div>
                <span className="block text-white font-bold text-lg">Instant</span>
                <span>Incident Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right 3D Interactive Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-md aspect-square rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-2xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-3 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Interactive 3D Seal</span>
              </div>
              <ThreeExaminationCanvas />
              <div className="absolute bottom-3 text-center w-full z-10 text-[10px] text-zinc-500 font-mono pointer-events-none">
                Interactive: Drag / Move Cursor to Inspect Node Matrix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Quick Selector Cards in Black & White */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-800">
            Role-Based Access Control
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
            Examination Portal Modules
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Select a verified role to launch its dedicated workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Head Role Card */}
          <div className="monochrome-card rounded-2xl p-6 flex flex-col justify-between hover:border-black dark:hover:border-white transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-black dark:text-white text-base">Head of Examination</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Super admin governance: manage examinee roster, release/withdraw results, review malpractice cases, unlock marks, and audit logs.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Super Admin</span>
              <button
                type="button"
                onClick={() => switchDemoUser("head")}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
              >
                Launch Portal <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Teacher Role Card */}
          <div className="monochrome-card rounded-2xl p-6 flex flex-col justify-between hover:border-black dark:hover:border-white transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-black dark:text-white text-base">Faculty Evaluator</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Grade assigned subjects, review digital answer scripts side-by-side, submit marks to trigger PDF generation, and evaluate revaluations.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Grading &amp; Reval</span>
              <button
                type="button"
                onClick={() => switchDemoUser("teacher")}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
              >
                Launch Portal <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Invigilator Role Card */}
          <div className="monochrome-card rounded-2xl p-6 flex flex-col justify-between hover:border-black dark:hover:border-white transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-black dark:text-white text-base">Hall Invigilator</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Mobile-optimized hall ops: verify candidates, mark real-time attendance, capture answer script photos, and report malpractice incidents.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Hall Operations</span>
              <button
                type="button"
                onClick={() => switchDemoUser("invigilator")}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
              >
                Launch Portal <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Examinee Role Card */}
          <div className="monochrome-card rounded-2xl p-6 flex flex-col justify-between hover:border-black dark:hover:border-white transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-black dark:text-white text-base">Enrolled Examinee</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                View exam timetable, download verified Admit Cards, inspect official published results, download signed marksheets, and submit revaluation appeals.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">Candidate View</span>
              <button
                type="button"
                onClick={() => switchDemoUser("student_normal")}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
              >
                Launch Portal <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SFS College Examination Leadership */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-800">
            SFS College Examination Board
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
            Examination Leadership &amp; Faculty
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Verified examination officials managing evaluation, invigilation and result governance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="monochrome-card rounded-2xl p-5 text-center space-y-3 hover:border-black dark:hover:border-white transition-all">
            <Avatar name="Dr. Annie Christila S." className="w-24 h-24 rounded-2xl  mx-auto border-2 border-zinc-200 dark:border-zinc-700 shadow-md" />
            <div>
              <h3 className="font-bold text-black dark:text-white text-sm">Dr. Annie Christila S.</h3>
              <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Head of Examination</p>
              <p className="text-[11px] text-zinc-500 mt-1">Result governance • Malpractice review • Audit control</p>
            </div>
            <button
              type="button"
              onClick={() => switchDemoUser("head")}
              className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Login as Head
            </button>
          </div>

          <div className="monochrome-card rounded-2xl p-5 text-center space-y-3 hover:border-black dark:hover:border-white transition-all">
            <Avatar name="Santhosh Kumar" className="w-24 h-24 rounded-2xl  mx-auto border-2 border-zinc-200 dark:border-zinc-700 shadow-md" />
            <div>
              <h3 className="font-bold text-black dark:text-white text-sm">Santhosh Kumar</h3>
              <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Teacher • Evaluator</p>
              <p className="text-[11px] text-zinc-500 mt-1">CS301 • CS303 evaluation &amp; revaluation review</p>
            </div>
            <button
              type="button"
              onClick={() => switchDemoUser("teacher")}
              className="w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Login as Teacher
            </button>
          </div>

          <div className="monochrome-card rounded-2xl p-5 text-center space-y-3 hover:border-black dark:hover:border-white transition-all">
            <Avatar name="Dr. Sailaja Mulakaluri" className="w-24 h-24 rounded-2xl  mx-auto border-2 border-zinc-200 dark:border-zinc-700 shadow-md" />
            <div>
              <h3 className="font-bold text-black dark:text-white text-sm">Dr. Sailaja Mulakaluri</h3>
              <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Teacher • Invigilator</p>
              <p className="text-[11px] text-zinc-500 mt-1">Hall 101 operations • Attendance • Script capture</p>
            </div>
            <button
              type="button"
              onClick={() => switchDemoUser("invigilator")}
              className="w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Login as Invigilator
            </button>
          </div>

          <div className="monochrome-card rounded-2xl p-5 text-center space-y-3 hover:border-black dark:hover:border-white transition-all">
            <Avatar name="Mr. Akhil Kumar K M" className="w-24 h-24 rounded-2xl  mx-auto border-2 border-zinc-200 dark:border-zinc-700 shadow-md" />
            <div>
              <h3 className="font-bold text-black dark:text-white text-sm">Mr. Akhil Kumar K M</h3>
              <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Teacher • Invigilator</p>
              <p className="text-[11px] text-zinc-500 mt-1">CS302 • CS304 evaluation &amp; hall duties</p>
            </div>
            <Link
              href="/login"
              className="block w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
            >
              View Staff Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Complete Examination Lifecycle in Black & White */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-800">
            Pipeline Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">
            End-to-End Operational Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="monochrome-card p-5 rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-mono font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-black dark:text-white">College Roster &amp; Hall Tickets</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Enrolled students are verified in the central registry with assigned seats and digital admit cards.
            </p>
          </div>

          <div className="monochrome-card p-5 rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-mono font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-black dark:text-white">Attendance &amp; Digitization</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hall invigilators verify arrivees, log attendance checklists, and capture answer script photo bundles.
            </p>
          </div>

          <div className="monochrome-card p-5 rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-mono font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-black dark:text-white">Evaluation &amp; Mark Locking</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Faculty grades examinees against digital scripts. Final submission generates sealed PDF archives.
            </p>
          </div>

          <div className="monochrome-card p-5 rounded-2xl space-y-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-mono font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="font-bold text-sm text-black dark:text-white">Result Release &amp; Reval</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Head publishes verified ledgers. Examinees check grades or submit revaluation appeals with tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
