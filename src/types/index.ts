export type Role = "head" | "staff" | "student";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phone?: string | null;
  role: Role;
  isTeacher: boolean;
  isInvigilator: boolean;
  avatarUrl?: string | null;
  status: "active" | "suspended" | "pending";
  createdAt?: string;
  student?: Student | null;
}

export interface Student {
  id: string;
  userId?: string | null;
  registerNumber?: string | null;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  course: string;
  semester: number;
  photoUrl?: string | null;
  documentUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  isResultReleased: boolean;
  resultReleasedAt?: string | null;
  revaluationDeadline?: string | null;
  revaluationFee: number;
  status: "draft" | "active" | "completed" | "results_published";
  createdAt?: string;
}

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  location: string;
}

export interface Subject {
  id: string;
  examId: string;
  code: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  hallId?: string | null;
  hallName?: string;
  maxMarks: number;
  passMarks: number;
  assignedTeacherId?: string | null;
  assignedTeacherName?: string;
  assignedInvigilatorId?: string | null;
  assignedInvigilatorName?: string;
  marksSubmissionStatus: "pending" | "draft" | "submitted" | "locked";
  submittedAt?: string | null;
}

export interface ExamRegistration {
  id: string;
  studentId: string;
  examId: string;
  hallTicketNumber: string;
  seatNumber: string;
  student?: Student;
}

export interface AttendanceRecord {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  status: "present" | "absent" | "late";
  markedById?: string | null;
  markedByName?: string;
  markedAt: string;
  notes?: string | null;
  student?: Student;
}

export interface AnswerPaper {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  pages: string[]; // array of image URLs/SVGs
  uploadedById?: string | null;
  uploadedByName?: string;
  uploadedAt: string;
  totalPages: number;
  notes?: string | null;
  student?: Student;
}

export interface MarkRecord {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  isAbsent: boolean;
  status: "draft" | "submitted" | "approved" | "withheld";
  evaluatedById?: string | null;
  evaluatedByName?: string;
  evaluatedAt?: string | null;
  remarks?: string | null;
  student?: Student;
  subject?: Subject;
}

export interface MalpracticeReport {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  reportedById: string;
  reportedByName?: string;
  incidentTime: string;
  malpracticeType: string;
  description: string;
  evidencePhotoUrl?: string | null;
  status: "reported" | "under_review" | "action_taken" | "closed";
  headDecision?: string | null;
  actionTaken?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  student?: Student;
  subject?: Subject;
}

export interface RevaluationRequest {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  originalMarks: number;
  revisedMarks?: number | null;
  reason: string;
  status: "applied" | "approved" | "under_review" | "completed" | "rejected";
  assignedTeacherId?: string | null;
  assignedTeacherName?: string;
  teacherRemarks?: string | null;
  headRemarks?: string | null;
  feePaid: boolean;
  appliedAt: string;
  resolvedAt?: string | null;
  student?: Student;
  subject?: Subject;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "urgent";
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
