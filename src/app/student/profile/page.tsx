"use client";


import { Avatar } from "@/components/Avatar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function StudentProfilePage() {
  const { user, sessionRemaining, extendSession } = useAuth();
  const student = user?.student;

  const name = student?.fullName || user?.name || "Joy Adhikari";
  const registerNumber = student?.registerNumber || user?.username || "U03ZW25S0092";
  const applicationNumber = student?.applicationNumber || "COL-CSE-2023-01";
  const course = student?.course || "B.Tech Computer Science & Engineering";
  const semester = student?.semester || 5;
  const email = student?.email || user?.email || "joy.adhikari@sfscollege.edu";
  const phone = student?.phone || user?.phone || "+1 (555) 678-9012";
  const minutes = Math.floor(sessionRemaining / 60);
  const seconds = sessionRemaining % 60;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Home
        </Link>
        <h1 className="text-2xl font-extrabold text-black dark:text-white">Examinee Profile &amp; Enrollment</h1>
        <p className="text-xs text-zinc-500">
          Official identity dossier verified in the SFS College registry.
        </p>
      </div>

      <section className="monochrome-card overflow-hidden rounded-2xl shadow-xl">
        <div className="bg-black text-white p-6 sm:p-8 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar name={name} className="h-24 w-24 rounded-2xl border-2 border-zinc-700  shadow-lg" />
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] font-mono font-bold text-zinc-300">
                <BadgeCheck className="h-3.5 w-3.5 text-white" />
                VERIFIED COLLEGE EXAMINEE
              </div>
              <h2 className="text-2xl font-extrabold text-white">{name}</h2>
              <p className="mt-1 text-sm text-zinc-400">{course}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-white font-bold">
                  REG NO: {registerNumber}
                </span>
                <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-zinc-300">
                  SEMESTER {semester}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8 text-xs">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-black dark:text-white uppercase tracking-wider font-mono">
              <UserRound className="h-4 w-4" /> Personal Particulars
            </h3>
            <ProfileItem icon={<Mail />} label="Registered Email" value={email} />
            <ProfileItem icon={<Phone />} label="Contact Number" value={phone} />
            <ProfileItem
              icon={<CalendarDays />}
              label="Date of Birth"
              value={student?.dateOfBirth || "2003-04-14"}
            />
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-black dark:text-white uppercase tracking-wider font-mono">
              <GraduationCap className="h-4 w-4" /> Examination Enrollment
            </h3>
            <ProfileItem icon={<BadgeCheck />} label="College Roll ID" value={applicationNumber} />
            <ProfileItem icon={<GraduationCap />} label="Degree &amp; Semester" value={`${course} · Semester ${semester}`} />
            <ProfileItem
              icon={<ShieldCheck />}
              label="Examination Status"
              value="ACTIVE &amp; ADMITTED"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="monochrome-card rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-black dark:text-white">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="flex-1 text-xs">
              <h3 className="text-sm font-bold text-black dark:text-white">Account Security</h3>
              <p className="mt-1 text-zinc-500 leading-relaxed">
                Portal username: <strong className="font-mono text-black dark:text-white">{user?.username}</strong>.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-xs">
                <span className="text-zinc-500 font-mono">
                  Session timeout: {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
                <button type="button" onClick={extendSession} className="font-bold text-black dark:text-white underline">
                  Extend
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="monochrome-card rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-black dark:text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <h3 className="text-sm font-bold text-black dark:text-white">Examination Venue</h3>
              <p className="mt-1 text-zinc-500 leading-relaxed">
                SFS College, Main Academic Block. Assigned seat: Seat A-12 in Hall 101.
              </p>
              <Link href="/student/admit-card" className="mt-3 inline-flex font-bold text-black dark:text-white hover:underline">
                View admit card &amp; hall allocation →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3">
      <span className="mt-0.5 text-zinc-500 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div>
        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">{label}</span>
        <span className="mt-0.5 block text-xs font-semibold text-black dark:text-white">{value}</span>
      </div>
    </div>
  );
}
