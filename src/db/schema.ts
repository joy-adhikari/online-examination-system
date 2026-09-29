import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'head' | 'staff' | 'student'
  isTeacher: boolean("is_teacher").default(false).notNull(),
  isInvigilator: boolean("is_invigilator").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  status: text("status").default("active").notNull(), // 'active' | 'suspended' | 'pending'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  registerNumber: text("register_number").unique(),
  applicationNumber: text("application_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  course: text("course").notNull(),
  semester: integer("semester").notNull().default(1),
  photoUrl: text("photo_url"),
  documentUrl: text("document_url"),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull().default(1),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isResultReleased: boolean("is_result_released").default(false).notNull(),
  resultReleasedAt: timestamp("result_released_at"),
  revaluationDeadline: text("revaluation_deadline"),
  revaluationFee: integer("revaluation_fee").default(25).notNull(),
  status: text("status").default("active").notNull(), // 'draft' | 'active' | 'completed' | 'results_published'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const halls = pgTable("halls", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(40),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  hallId: text("hall_id").references(() => halls.id),
  maxMarks: integer("max_marks").notNull().default(100),
  passMarks: integer("pass_marks").notNull().default(40),
  assignedTeacherId: text("assigned_teacher_id").references(() => users.id),
  assignedInvigilatorId: text("assigned_invigilator_id").references(() => users.id),
  marksSubmissionStatus: text("marks_submission_status").default("pending").notNull(), // 'pending' | 'draft' | 'submitted' | 'locked'
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examRegistrations = pgTable("exam_registrations", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => students.id).notNull(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  hallTicketNumber: text("hall_ticket_number").notNull().unique(),
  seatNumber: text("seat_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  studentId: text("student_id").references(() => students.id).notNull(),
  status: text("status").default("absent").notNull(), // 'present' | 'absent' | 'late'
  markedById: text("marked_by_id").references(() => users.id),
  markedAt: timestamp("marked_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const answerPapers = pgTable("answer_papers", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  studentId: text("student_id").references(() => students.id).notNull(),
  pages: text("pages").notNull(), // JSON string array of image URLs/data
  uploadedById: text("uploaded_by_id").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  totalPages: integer("total_pages").default(1).notNull(),
  notes: text("notes"),
});

export const marks = pgTable("marks", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  studentId: text("student_id").references(() => students.id).notNull(),
  theoryMarks: integer("theory_marks").default(0).notNull(),
  practicalMarks: integer("practical_marks").default(0).notNull(),
  totalMarks: integer("total_marks").default(0).notNull(),
  isAbsent: boolean("is_absent").default(false).notNull(),
  status: text("status").default("draft").notNull(), // 'draft' | 'submitted' | 'approved' | 'withheld'
  evaluatedById: text("evaluated_by_id").references(() => users.id),
  evaluatedAt: timestamp("evaluated_at"),
  remarks: text("remarks"),
});

export const malpracticeReports = pgTable("malpractice_reports", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  studentId: text("student_id").references(() => students.id).notNull(),
  reportedById: text("reported_by_id").references(() => users.id).notNull(),
  incidentTime: timestamp("incident_time").defaultNow().notNull(),
  malpracticeType: text("malpractice_type").notNull(), // 'Possession of Unauthorized Material' | 'Mobile Phone Usage' | 'Copying' | 'Impersonation' | 'Disruptive Behavior'
  description: text("description").notNull(),
  evidencePhotoUrl: text("evidence_photo_url"),
  status: text("status").default("reported").notNull(), // 'reported' | 'under_review' | 'action_taken' | 'closed'
  headDecision: text("head_decision"),
  actionTaken: text("action_taken"), // 'Marks Withheld' | 'Exam Cancelled' | 'Warning Issued' | 'Exonerated'
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revaluationRequests = pgTable("revaluation_requests", {
  id: text("id").primaryKey(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  studentId: text("student_id").references(() => students.id).notNull(),
  originalMarks: integer("original_marks").notNull(),
  revisedMarks: integer("revised_marks"),
  reason: text("reason").notNull(),
  status: text("status").default("applied").notNull(), // 'applied' | 'approved' | 'under_review' | 'completed' | 'rejected'
  assignedTeacherId: text("assigned_teacher_id").references(() => users.id),
  teacherRemarks: text("teacher_remarks"),
  headRemarks: text("head_remarks"),
  feePaid: boolean("fee_paid").default(true).notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const generatedPdfs = pgTable("generated_pdfs", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => students.id).notNull(),
  examId: text("exam_id").references(() => exams.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  pdfType: text("pdf_type").notNull(), // 'answer_sheet_bundle' | 'marksheet' | 'hall_ticket'
  fileUrl: text("file_url").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // null or 'all' or specific userId
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info").notNull(), // 'info' | 'success' | 'warning' | 'urgent'
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
