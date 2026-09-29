import { createSeedData, type Row, type SeedTables } from "./seed-data";

export type { Row };
export type DB = SeedTables;

const STORAGE_KEY = "sfs_exam_db_v1";
let cache: DB | null = null;
let warnedQuota = false;

export const now = () => new Date().toISOString();
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function def(row: Row, key: string, value: unknown) {
  if (row[key] === undefined) row[key] = value;
}

/** Fill the defaults the old PostgreSQL schema used to provide. */
function normalize(raw: DB): DB {
  const db = JSON.parse(JSON.stringify(raw)) as DB;
  const base = Date.now();
  // Rows without timestamps keep their list order when sorted newest-first.
  const stamp = (rows: Row[], key: string) =>
    rows.forEach((r, i) => def(r, key, new Date(base - i * 1000).toISOString()));

  const tables = Object.keys(db) as (keyof DB)[];
  tables.forEach((t) => {
    if (!Array.isArray(db[t])) (db as any)[t] = [];
  });

  stamp(db.users, "createdAt");
  db.users.forEach((u) => {
    def(u, "updatedAt", u.createdAt);
    def(u, "phone", null);
    def(u, "avatarUrl", null);
    def(u, "status", "active");
    def(u, "isTeacher", false);
    def(u, "isInvigilator", false);
  });

  stamp(db.students, "createdAt");
  db.students.forEach((s) => {
    def(s, "rejectionReason", null);
    def(s, "approvedAt", null);
    def(s, "photoUrl", null);
    def(s, "documentUrl", null);
  });

  stamp(db.exams, "createdAt");
  db.exams.forEach((e) => {
    def(e, "isResultReleased", false);
    def(e, "resultReleasedAt", null);
    def(e, "revaluationDeadline", null);
    def(e, "revaluationFee", 25);
    def(e, "status", "active");
  });

  stamp(db.halls, "createdAt");
  stamp(db.subjects, "createdAt");
  db.subjects.forEach((s) => {
    def(s, "marksSubmissionStatus", "pending");
    def(s, "submittedAt", null);
    def(s, "hallId", null);
    def(s, "assignedTeacherId", null);
    def(s, "assignedInvigilatorId", null);
  });

  stamp(db.examRegistrations, "createdAt");
  stamp(db.attendance, "markedAt");
  db.attendance.forEach((a) => {
    def(a, "notes", null);
    def(a, "markedById", null);
  });

  stamp(db.answerPapers, "uploadedAt");
  db.answerPapers.forEach((p) => {
    if (typeof p.pages === "string") {
      try {
        p.pages = JSON.parse(p.pages);
      } catch {
        p.pages = [p.pages];
      }
    }
    def(p, "pages", []);
    def(p, "totalPages", p.pages.length);
    def(p, "notes", null);
  });

  db.marks.forEach((m) => {
    def(m, "theoryMarks", 0);
    def(m, "practicalMarks", 0);
    def(m, "totalMarks", 0);
    def(m, "isAbsent", false);
    def(m, "status", "draft");
    def(m, "evaluatedById", null);
    def(m, "evaluatedAt", null);
    def(m, "remarks", null);
  });

  db.malpracticeReports.forEach((r) => {
    def(r, "incidentTime", now());
    def(r, "createdAt", r.incidentTime);
    def(r, "status", "reported");
    def(r, "evidencePhotoUrl", null);
    def(r, "headDecision", null);
    def(r, "actionTaken", null);
    def(r, "decidedAt", null);
  });

  db.revaluationRequests.forEach((r) => {
    def(r, "revisedMarks", null);
    def(r, "status", "applied");
    def(r, "assignedTeacherId", null);
    def(r, "teacherRemarks", null);
    def(r, "headRemarks", null);
    def(r, "feePaid", true);
    def(r, "appliedAt", now());
    def(r, "resolvedAt", null);
  });

  stamp(db.auditLogs, "createdAt");
  stamp(db.notifications, "createdAt");
  db.notifications.forEach((n) => {
    def(n, "userId", null);
    def(n, "type", "info");
    def(n, "isRead", false);
    def(n, "link", null);
  });

  return db;
}

export function getDB(): DB {
  if (cache) return cache;
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        cache = normalize(JSON.parse(saved));
        return cache;
      }
    } catch (e) {
      console.warn("Stored exam data was unreadable; restoring demo data.", e);
    }
  }
  cache = normalize(createSeedData());
  saveDB();
  return cache;
}

export function saveDB() {
  if (!cache || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Could not persist exam data to browser storage.", e);
    if (!warnedQuota) {
      warnedQuota = true;
      alert(
        "Browser storage is full, so recent changes (usually large photo uploads) will only last until this tab is closed. Use 'Reset demo data' to free space."
      );
    }
  }
}

export function resetDB() {
  cache = normalize(createSeedData());
  saveDB();
}

export const byNewest = (key: string) => (a: Row, b: Row) =>
  String(b[key] ?? "").localeCompare(String(a[key] ?? ""));
