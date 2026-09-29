import { getDB, saveDB, resetDB, uid, now, byNewest, type DB, type Row } from "./store";

export interface MockResponse {
  status?: number;
  body: unknown;
}

type Handler = (req: { method: string; url: URL; body: any }) => MockResponse | Promise<MockResponse>;

const ok = (body: unknown): MockResponse => ({ status: 200, body });
const fail = (status: number, error: string): MockResponse => ({ status, body: { success: false, error } });

const HEAD_NAME = "Dr. Annie Christila S.";

function audit(db: DB, entry: { userId?: string | null; userName: string; action: string; entityType: string; entityId: string; details: string }) {
  db.auditLogs.push({ id: uid("aud"), userId: entry.userId ?? null, createdAt: now(), ...entry });
}

function notify(db: DB, n: { userId: string | null; title: string; message: string; type?: string; link?: string | null }) {
  db.notifications.push({ id: uid("notif"), type: "info", link: null, isRead: false, createdAt: now(), ...n });
}

const findStudent = (db: DB, id: string) => db.students.find((s) => s.id === id);
const findSubject = (db: DB, id: string) => db.subjects.find((s) => s.id === id);

/* ------------------------------------------------------------------ */
/* Seed / reset                                                        */
/* ------------------------------------------------------------------ */
const seed: Handler = ({ url }) => {
  if (url.searchParams.get("force") === "true") {
    resetDB();
    return ok({ success: true, message: "Demo data restored successfully" });
  }
  getDB();
  return ok({ success: true, message: "Demo data ready" });
};

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */
const login: Handler = ({ body }) => {
  const db = getDB();
  const { identifier, password } = body || {};
  if (!identifier || !password) return fail(400, "Username or Register Number and password are required");

  const id = String(identifier).trim();
  const idLower = id.toLowerCase();
  let user = db.users.find((u) => u.email.toLowerCase() === idLower || u.username.toLowerCase() === idLower);
  let student: Row | null = null;

  if (!user) {
    student =
      db.students.find(
        (s) =>
          (s.registerNumber && s.registerNumber.toLowerCase() === idLower) ||
          s.applicationNumber.toLowerCase() === idLower ||
          s.email.toLowerCase() === idLower
      ) || null;
    if (student?.userId) user = db.users.find((u) => u.id === student!.userId);
  }

  if (!user) return fail(404, "User not found with provided identifier");
  if (user.status === "suspended") return fail(403, "Account is suspended. Please contact the Head of Examination.");
  if (user.passwordHash !== password) return fail(401, "Invalid password credentials");

  if (!student && user.role === "student") student = db.students.find((s) => s.userId === user!.id) || null;

  audit(db, {
    userId: user.id,
    userName: user.name,
    action: "USER_LOGIN",
    entityType: "user",
    entityId: user.id,
    details: `Successful login as ${user.role} (${user.username}).`,
  });
  saveDB();

  const { passwordHash: _omit, ...safe } = user;
  return ok({ success: true, user: { ...safe, student } });
};

const resetPassword: Handler = ({ body }) => {
  const db = getDB();
  const { userId, newPassword, adminInitiated, requesterName } = body || {};
  if (!userId || !newPassword) return fail(400, "User ID and new password are required");
  const user = db.users.find((u) => u.id === userId);
  if (!user) return fail(404, "User not found");

  user.passwordHash = newPassword;
  user.updatedAt = now();
  audit(db, {
    userId,
    userName: requesterName || user.name,
    action: adminInitiated ? "ADMIN_PASSWORD_RESET" : "USER_PASSWORD_RESET",
    entityType: "user",
    entityId: userId,
    details: adminInitiated
      ? `Password reset initiated by ${requesterName || "Head of Examination"} for user ${user.username}.`
      : "User reset their own password.",
  });
  notify(db, {
    userId,
    title: "Password Updated",
    message: adminInitiated
      ? "Your account password was updated by the Examination Office."
      : "Your password was successfully updated.",
  });
  saveDB();
  return ok({ success: true, message: "Password updated successfully" });
};

/* ------------------------------------------------------------------ */
/* Examinee roster                                                     */
/* ------------------------------------------------------------------ */
const registrations: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    return ok({ success: true, students: [...db.students].sort(byNewest("createdAt")) });
  }

  if (method === "POST") {
    const { fullName, email, phone, dateOfBirth, course, semester, registerNumber, applicationNumber, adminName } = body || {};
    if (!fullName || !email || !course) return fail(400, "Candidate name, email, and course are required");

    const regNo = registerNumber
      ? String(registerNumber).trim().toUpperCase()
      : "U03ZW25S0" + String(Math.floor(200 + Math.random() * 800)).padStart(3, "0");
    const cleanEmail = String(email).trim().toLowerCase();

    if (db.users.some((u) => u.username.toLowerCase() === regNo.toLowerCase()))
      return fail(400, `Register number ${regNo} is already assigned to another examinee.`);
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail))
      return fail(400, `An account with email ${cleanEmail} already exists.`);

    const appNo = applicationNumber
      ? String(applicationNumber).trim().toUpperCase()
      : "COL-CSE-2025-" + Math.floor(10 + Math.random() * 90);
    const studentId = uid("stu");
    const userId = uid("usr_stu");
    const ts = now();

    db.users.push({
      id: userId,
      email: cleanEmail,
      username: regNo,
      passwordHash: "password123",
      name: String(fullName).trim(),
      phone: phone || null,
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    });

    db.students.push({
      id: studentId,
      userId,
      registerNumber: regNo,
      applicationNumber: appNo,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: phone || "Not provided",
      dateOfBirth: dateOfBirth || "2004-01-01",
      course,
      semester: Number(semester) || 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      rejectionReason: null,
      approvedAt: ts,
      createdAt: ts,
    });

    const latestExam = [...db.exams].sort(byNewest("createdAt"))[0];
    if (latestExam) {
      db.examRegistrations.push({
        id: uid("reg"),
        studentId,
        examId: latestExam.id,
        hallTicketNumber: `HT-${regNo}`,
        seatNumber: `A-${Math.floor(10 + Math.random() * 30)}`,
        createdAt: ts,
      });
    }

    audit(db, {
      userId: "usr_head",
      userName: adminName || HEAD_NAME,
      action: "STUDENT_ENROLLED",
      entityType: "student",
      entityId: studentId,
      details: `Enrolled examinee ${fullName} (Reg: ${regNo}) into examination roster.`,
    });
    saveDB();
    return ok({ success: true, message: `Candidate ${fullName} enrolled with Register No: ${regNo}`, studentId, registerNumber: regNo });
  }

  if (method === "DELETE") {
    const studentId = url.searchParams.get("studentId");
    if (!studentId) return fail(400, "studentId is required");
    const student = findStudent(db, studentId);
    if (!student) return fail(404, "Student not found");
    db.users = db.users.filter((u) => u.id !== student.userId);
    db.students = db.students.filter((s) => s.id !== studentId);
    db.examRegistrations = db.examRegistrations.filter((r) => r.studentId !== studentId);
    audit(db, {
      userId: "usr_head",
      userName: HEAD_NAME,
      action: "STUDENT_REMOVED",
      entityType: "student",
      entityId: studentId,
      details: `Removed ${student.fullName} (${student.registerNumber}) from examination roster.`,
    });
    saveDB();
    return ok({ success: true, message: "Candidate removed from examination roster." });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */
const staffUsers: Handler = ({ method, body }) => {
  const db = getDB();

  if (method === "GET") {
    const staff = db.users
      .filter((u) => u.role === "staff" || u.role === "head")
      .sort(byNewest("createdAt"))
      .map(({ passwordHash: _p, ...u }) => ({
        ...u,
        teacherSubjectsCount: db.subjects.filter((s) => s.assignedTeacherId === u.id).length,
        invigilatorSubjectsCount: db.subjects.filter((s) => s.assignedInvigilatorId === u.id).length,
      }));
    return ok({ success: true, users: staff });
  }

  if (method === "POST") {
    const { name, email, username, phone, isTeacher, isInvigilator, password, adminName } = body || {};
    if (!name || !email || !username) return fail(400, "Name, email, and username are required");
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUser = String(username).trim();
    if (db.users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) return fail(400, "That username is already taken.");
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) return fail(400, "That email is already registered.");

    const id = uid("usr_staff");
    const ts = now();
    db.users.push({
      id,
      name: String(name).trim(),
      email: cleanEmail,
      username: cleanUser,
      phone: phone || null,
      passwordHash: password || "password123",
      role: "staff",
      isTeacher: Boolean(isTeacher),
      isInvigilator: Boolean(isInvigilator),
      avatarUrl: null,
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    });
    audit(db, {
      userId: "usr_head",
      userName: adminName || HEAD_NAME,
      action: "STAFF_CREATED",
      entityType: "user",
      entityId: id,
      details: `Created staff account for ${name} (${cleanUser}). Teacher: ${Boolean(isTeacher)}, Invigilator: ${Boolean(isInvigilator)}.`,
    });
    saveDB();
    return ok({ success: true, message: "Staff user created successfully", userId: id });
  }

  if (method === "PATCH") {
    const { userId, isTeacher, isInvigilator, status, password, adminName } = body || {};
    const user = db.users.find((u) => u.id === userId);
    if (!user) return fail(404, "Staff member not found");
    if (isTeacher !== undefined) user.isTeacher = Boolean(isTeacher);
    if (isInvigilator !== undefined) user.isInvigilator = Boolean(isInvigilator);
    if (status !== undefined) user.status = status;
    if (password) user.passwordHash = password;
    user.updatedAt = now();
    audit(db, {
      userId: "usr_head",
      userName: adminName || HEAD_NAME,
      action: "STAFF_UPDATED",
      entityType: "user",
      entityId: userId,
      details: `Updated permissions/status for ${user.name}.`,
    });
    saveDB();
    return ok({ success: true, message: "Staff member updated successfully" });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Exams, subjects & halls                                             */
/* ------------------------------------------------------------------ */
function enrichSubject(db: DB, s: Row): Row {
  const hall = db.halls.find((h) => h.id === s.hallId);
  const teacher = db.users.find((u) => u.id === s.assignedTeacherId);
  const invigilator = db.users.find((u) => u.id === s.assignedInvigilatorId);
  return {
    ...s,
    hallName: hall ? hall.name : "Unassigned Hall",
    assignedTeacherName: teacher ? teacher.name : "Unassigned Teacher",
    assignedInvigilatorName: invigilator ? invigilator.name : "Unassigned Invigilator",
  };
}

const exams: Handler = ({ method, body }) => {
  const db = getDB();

  if (method === "GET") {
    const subjects = [...db.subjects].sort(byNewest("date")).map((s) => enrichSubject(db, s));
    const examList = [...db.exams].sort(byNewest("createdAt")).map((e) => ({
      ...e,
      subjects: subjects.filter((s) => s.examId === e.id),
      candidateCount: db.examRegistrations.filter((r) => r.examId === e.id).length,
    }));
    return ok({ success: true, exams: examList, halls: db.halls, subjects });
  }

  if (method === "POST") {
    const { type } = body || {};
    if (type === "exam") {
      const { title, academicYear, semester, startDate, endDate, revaluationDeadline, revaluationFee } = body;
      if (!title) return fail(400, "Examination title is required");
      const id = uid("exam");
      db.exams.push({
        id,
        title,
        academicYear,
        semester: Number(semester) || 1,
        startDate,
        endDate,
        isResultReleased: false,
        resultReleasedAt: null,
        revaluationDeadline: revaluationDeadline || null,
        revaluationFee: Number(revaluationFee) || 25,
        status: "active",
        createdAt: now(),
      });
      audit(db, { userId: "usr_head", userName: HEAD_NAME, action: "EXAM_CREATED", entityType: "exam", entityId: id, details: `Created examination: ${title} (${academicYear}).` });
      saveDB();
      return ok({ success: true, examId: id, message: "Examination created successfully" });
    }

    if (type === "subject") {
      const { examId, code, name, date, startTime, endTime, hallId, maxMarks, passMarks, assignedTeacherId, assignedInvigilatorId } = body;
      if (!examId || !code || !name) return fail(400, "Exam, subject code and name are required");
      const id = uid(`subj_${String(code).toLowerCase().replace(/\s+/g, "")}`);
      db.subjects.push({
        id,
        examId,
        code,
        name,
        date,
        startTime,
        endTime,
        hallId: hallId || null,
        maxMarks: Number(maxMarks) || 100,
        passMarks: Number(passMarks) || 40,
        assignedTeacherId: assignedTeacherId || null,
        assignedInvigilatorId: assignedInvigilatorId || null,
        marksSubmissionStatus: "pending",
        submittedAt: null,
        createdAt: now(),
      });
      audit(db, { userId: "usr_head", userName: HEAD_NAME, action: "SUBJECT_CREATED", entityType: "subject", entityId: id, details: `Added ${code} - ${name} to the timetable.` });
      saveDB();
      return ok({ success: true, subjectId: id, message: "Subject added successfully" });
    }

    if (type === "hall") {
      const { name, capacity, location } = body;
      if (!name) return fail(400, "Hall name is required");
      const id = uid("hall");
      db.halls.push({ id, name, capacity: Number(capacity) || 40, location, createdAt: now() });
      saveDB();
      return ok({ success: true, hallId: id, message: "Exam Hall added successfully" });
    }

    return fail(400, "Invalid type specified");
  }

  if (method === "PATCH") {
    const { action, examId, isResultReleased, subjectId, assignedTeacherId, assignedInvigilatorId } = body || {};

    if (action === "toggle_results") {
      const exam = db.exams.find((e) => e.id === examId);
      if (!exam) return fail(404, "Exam not found");
      const release = Boolean(isResultReleased);
      exam.isResultReleased = release;
      exam.resultReleasedAt = release ? now() : null;
      exam.status = release ? "results_published" : "active";
      audit(db, {
        userId: "usr_head",
        userName: HEAD_NAME,
        action: release ? "RESULT_RELEASED" : "RESULT_WITHDRAWN",
        entityType: "exam",
        entityId: examId,
        details: release ? `Published results for ${exam.title}.` : `Withdrew results for ${exam.title}.`,
      });
      if (release) {
        notify(db, {
          userId: null,
          title: "Examination Results Published!",
          message: `Official results for ${exam.title} are now released. You can view your marksheet and apply for revaluation.`,
          type: "success",
          link: "/student/results",
        });
      }
      saveDB();
      return ok({
        success: true,
        isResultReleased: release,
        message: release ? "Results have been published successfully!" : "Results have been unpublished / hidden from students.",
      });
    }

    if (action === "update_subject_staff") {
      const subject = findSubject(db, subjectId);
      if (!subject) return fail(404, "Subject not found");
      if (assignedTeacherId !== undefined) subject.assignedTeacherId = assignedTeacherId || null;
      if (assignedInvigilatorId !== undefined) subject.assignedInvigilatorId = assignedInvigilatorId || null;
      saveDB();
      return ok({ success: true, message: "Staff assignments updated successfully" });
    }

    return fail(400, "Unknown action");
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */
const attendance: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    const examId = url.searchParams.get("examId");
    const subjectId = url.searchParams.get("subjectId");
    if (!examId || !subjectId) return fail(400, "examId and subjectId are required");

    const rows = db.examRegistrations
      .filter((r) => r.examId === examId)
      .map((reg) => {
        const st = findStudent(db, reg.studentId);
        if (!st) return null;
        const att = db.attendance.find((a) => a.examId === examId && a.subjectId === subjectId && a.studentId === st.id);
        return {
          studentId: st.id,
          registerNumber: st.registerNumber,
          fullName: st.fullName,
          photoUrl: st.photoUrl,
          seatNumber: reg.seatNumber,
          hallTicketNumber: reg.hallTicketNumber,
          course: st.course,
          attendanceId: att?.id || null,
          status: att?.status || "unmarked",
          notes: att?.notes || "",
          markedAt: att?.markedAt || null,
        };
      })
      .filter(Boolean);
    return ok({ success: true, attendance: rows });
  }

  if (method === "POST") {
    const { examId, subjectId, records, markedById, markerName } = body || {};
    if (!examId || !subjectId || !Array.isArray(records)) return fail(400, "examId, subjectId, and records array are required");

    records.forEach((rec: Row) => {
      const existing = db.attendance.find((a) => a.examId === examId && a.subjectId === subjectId && a.studentId === rec.studentId);
      if (existing) {
        existing.status = rec.status;
        existing.notes = rec.notes || null;
        existing.markedById = markedById || existing.markedById;
        existing.markedAt = now();
      } else {
        db.attendance.push({
          id: uid("att"),
          examId,
          subjectId,
          studentId: rec.studentId,
          status: rec.status,
          notes: rec.notes || null,
          markedById: markedById || null,
          markedAt: now(),
        });
      }
    });

    const subject = findSubject(db, subjectId);
    audit(db, {
      userId: markedById || null,
      userName: markerName || "Invigilator",
      action: "ATTENDANCE_MARKED",
      entityType: "attendance",
      entityId: subjectId,
      details: `Updated attendance for ${records.length} students in ${subject?.code || subjectId}.`,
    });
    saveDB();
    return ok({ success: true, message: "Attendance saved successfully" });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Answer papers                                                       */
/* ------------------------------------------------------------------ */
const answerPapers: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    const subjectId = url.searchParams.get("subjectId");
    const studentId = url.searchParams.get("studentId");
    if (subjectId && studentId) {
      const paper = db.answerPapers.find((p) => p.subjectId === subjectId && p.studentId === studentId);
      return ok({ success: true, paper: paper || null });
    }
    if (subjectId) return ok({ success: true, papers: db.answerPapers.filter((p) => p.subjectId === subjectId) });
    return fail(400, "subjectId is required");
  }

  if (method === "POST") {
    const { examId, subjectId, studentId, pages, notes, uploadedById, uploaderName } = body || {};
    if (!examId || !subjectId || !studentId || !Array.isArray(pages)) return fail(400, "examId, subjectId, studentId, and pages array are required");

    const existing = db.answerPapers.find((p) => p.examId === examId && p.subjectId === subjectId && p.studentId === studentId);
    if (existing) {
      existing.pages = pages;
      existing.totalPages = pages.length;
      existing.notes = notes || existing.notes;
      existing.uploadedById = uploadedById || existing.uploadedById;
      existing.uploadedAt = now();
    } else {
      db.answerPapers.push({
        id: uid("ap"),
        examId,
        subjectId,
        studentId,
        pages,
        totalPages: pages.length,
        notes: notes || null,
        uploadedById: uploadedById || null,
        uploadedAt: now(),
      });
    }

    const student = findStudent(db, studentId);
    audit(db, {
      userId: uploadedById || null,
      userName: uploaderName || "Invigilator",
      action: "ANSWER_PAPERS_UPLOADED",
      entityType: "answer_paper",
      entityId: `${subjectId}_${studentId}`,
      details: `Uploaded ${pages.length} answer booklet page(s) for ${student?.fullName || studentId} (${student?.registerNumber || ""}).`,
    });
    saveDB();
    return ok({ success: true, message: "Answer paper pages uploaded successfully!" });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Marks                                                               */
/* ------------------------------------------------------------------ */
const marks: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    const subjectId = url.searchParams.get("subjectId");
    const studentId = url.searchParams.get("studentId");
    if (subjectId) {
      const subject = findSubject(db, subjectId);
      return ok({
        success: true,
        subject: subject ? enrichSubject(db, subject) : null,
        marks: db.marks.filter((m) => m.subjectId === subjectId).map((m) => ({ ...m, student: findStudent(db, m.studentId) })),
      });
    }
    if (studentId) {
      return ok({
        success: true,
        marks: db.marks.filter((m) => m.studentId === studentId).map((m) => ({ ...m, subject: findSubject(db, m.subjectId) })),
      });
    }
    return fail(400, "subjectId or studentId is required");
  }

  if (method === "POST") {
    const { examId, subjectId, records, submitAction, evaluatedById, evaluatorName } = body || {};
    if (!examId || !subjectId || !Array.isArray(records)) return fail(400, "examId, subjectId, and records array are required");
    const subject = findSubject(db, subjectId);
    if (!subject) return fail(404, "Subject not found");
    if (subject.marksSubmissionStatus === "submitted")
      return fail(403, "Marks for this subject are already submitted and locked. Request unlock from the Head of Examination.");

    const submitting = submitAction === "submit";
    const markStatus = submitting ? "submitted" : "draft";

    records.forEach((rec: Row) => {
      const theory = Number(rec.theoryMarks) || 0;
      const practical = Number(rec.practicalMarks) || 0;
      const total = rec.isAbsent ? 0 : theory + practical;
      const existing = db.marks.find((m) => m.examId === examId && m.subjectId === subjectId && m.studentId === rec.studentId);

      if (existing) {
        existing.theoryMarks = theory;
        existing.practicalMarks = practical;
        existing.totalMarks = total;
        existing.isAbsent = Boolean(rec.isAbsent);
        existing.status = existing.status === "withheld" ? "withheld" : markStatus;
        existing.remarks = rec.remarks || existing.remarks;
        existing.evaluatedById = evaluatedById || existing.evaluatedById;
        existing.evaluatedAt = now();
      } else {
        db.marks.push({
          id: uid("mark"),
          examId,
          subjectId,
          studentId: rec.studentId,
          theoryMarks: theory,
          practicalMarks: practical,
          totalMarks: total,
          isAbsent: Boolean(rec.isAbsent),
          status: markStatus,
          remarks: rec.remarks || null,
          evaluatedById: evaluatedById || null,
          evaluatedAt: now(),
        });
      }

      if (submitting && !db.generatedPdfs.some((p) => p.subjectId === subjectId && p.studentId === rec.studentId)) {
        db.generatedPdfs.push({
          id: uid("pdf"),
          studentId: rec.studentId,
          examId,
          subjectId,
          pdfType: "answer_sheet_bundle",
          fileUrl: `generated-in-browser:${subjectId}:${rec.studentId}`,
          generatedAt: now(),
        });
      }
    });

    if (submitting) {
      subject.marksSubmissionStatus = "submitted";
      subject.submittedAt = now();
      notify(db, {
        userId: "usr_head",
        title: `Marks Submitted for ${subject.code}`,
        message: `${evaluatorName || "Teacher"} submitted final marks for ${subject.code} (${subject.name}). Answer-sheet PDFs are ready for ${records.length} students.`,
        type: "success",
        link: "/head/marks",
      });
    } else if (subject.marksSubmissionStatus === "pending") {
      subject.marksSubmissionStatus = "draft";
    }

    audit(db, {
      userId: evaluatedById || null,
      userName: evaluatorName || "Teacher",
      action: submitting ? "MARK_SUBMITTED" : "MARK_DRAFT_SAVED",
      entityType: "subject",
      entityId: subjectId,
      details: `${submitting ? "Submitted and locked marks" : "Saved draft marks"} for ${records.length} candidates in ${subject.code}.`,
    });
    saveDB();
    return ok({
      success: true,
      message: submitting ? "Marks submitted successfully! Answer sheet PDFs generated and locked." : "Draft marks saved successfully.",
    });
  }

  if (method === "PATCH") {
    const { action, subjectId, markId, totalMarks, reason, requesterName, requesterId } = body || {};

    if (action === "head_unlock") {
      const subject = findSubject(db, subjectId);
      if (!subject) return fail(404, "Subject not found");
      subject.marksSubmissionStatus = "draft";
      audit(db, {
        userId: requesterId || "usr_head",
        userName: requesterName || HEAD_NAME,
        action: "MARKS_UNLOCKED_BY_HEAD",
        entityType: "subject",
        entityId: subjectId,
        details: `Head unlocked mark submission for ${subject.code} to allow corrections.`,
      });
      if (subject.assignedTeacherId) {
        notify(db, {
          userId: subject.assignedTeacherId,
          title: `${subject.code} marks unlocked`,
          message: "The Head of Examination unlocked this subject. You can edit and resubmit marks.",
          type: "warning",
          link: `/teacher/marks?subjectId=${subject.id}`,
        });
      }
      saveDB();
      return ok({ success: true, message: "Subject marks unlocked for teacher modification" });
    }

    if (action === "head_override") {
      const mark = db.marks.find((m) => m.id === markId);
      if (!mark || totalMarks === undefined) return fail(400, "markId and totalMarks are required");
      mark.totalMarks = Number(totalMarks);
      mark.remarks = reason ? `[Head Override]: ${reason}` : "[Head Override]";
      audit(db, {
        userId: requesterId || "usr_head",
        userName: requesterName || HEAD_NAME,
        action: "MARK_OVERRIDDEN_BY_HEAD",
        entityType: "mark",
        entityId: markId,
        details: `Score adjusted to ${totalMarks}. Justification: ${reason || "Head revision"}`,
      });
      saveDB();
      return ok({ success: true, message: "Mark updated by Head of Examination" });
    }

    return fail(400, "Invalid action");
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Malpractice                                                         */
/* ------------------------------------------------------------------ */
const malpractice: Handler = ({ method, body }) => {
  const db = getDB();

  if (method === "GET") {
    const reports = [...db.malpracticeReports].sort(byNewest("createdAt")).map((r) => ({
      ...r,
      student: findStudent(db, r.studentId),
      subject: findSubject(db, r.subjectId),
      exam: db.exams.find((e) => e.id === r.examId),
      reportedByName: db.users.find((u) => u.id === r.reportedById)?.name || "Invigilator",
    }));
    return ok({ success: true, reports });
  }

  if (method === "POST") {
    const { examId, subjectId, studentId, reportedById, reporterName, malpracticeType, description, evidencePhotoUrl } = body || {};
    if (!examId || !subjectId || !studentId || !reportedById || !malpracticeType || !description)
      return fail(400, "examId, subjectId, studentId, reportedById, malpracticeType, and description are required");

    const id = uid("malp");
    const ts = now();
    db.malpracticeReports.push({
      id,
      examId,
      subjectId,
      studentId,
      reportedById,
      incidentTime: ts,
      malpracticeType,
      description,
      evidencePhotoUrl: evidencePhotoUrl || null,
      status: "reported",
      headDecision: null,
      actionTaken: "Marks Withheld",
      decidedAt: null,
      createdAt: ts,
    });

    const mark = db.marks.find((m) => m.examId === examId && m.subjectId === subjectId && m.studentId === studentId);
    if (mark) mark.status = "withheld";
    else
      db.marks.push({
        id: uid("mark"),
        examId,
        subjectId,
        studentId,
        theoryMarks: 0,
        practicalMarks: 0,
        totalMarks: 0,
        isAbsent: false,
        status: "withheld",
        evaluatedById: null,
        evaluatedAt: null,
        remarks: "Result withheld due to active malpractice investigation.",
      });

    const student = findStudent(db, studentId);
    const subject = findSubject(db, subjectId);
    notify(db, {
      userId: "usr_head",
      title: "URGENT: Malpractice Incident Reported",
      message: `${reporterName || "Invigilator"} reported ${malpracticeType} by ${student?.fullName || studentId} (${student?.registerNumber || ""}) during ${subject?.code || "the exam"}.`,
      type: "urgent",
      link: "/head/malpractice",
    });
    audit(db, {
      userId: reportedById,
      userName: reporterName || "Invigilator",
      action: "MALPRACTICE_REPORTED",
      entityType: "malpractice",
      entityId: id,
      details: `Reported ${malpracticeType} for ${student?.fullName} (${student?.registerNumber}). Result automatically withheld.`,
    });
    saveDB();
    return ok({ success: true, reportId: id, message: "Malpractice report submitted and sent to the Head of Examination." });
  }

  if (method === "PATCH") {
    const { reportId, status, headDecision, actionTaken, reviewerName } = body || {};
    const report = db.malpracticeReports.find((r) => r.id === reportId);
    if (!report || !status) return fail(404, "Malpractice report not found");

    report.status = status;
    report.headDecision = headDecision || report.headDecision;
    report.actionTaken = actionTaken || report.actionTaken;
    report.decidedAt = now();

    const mark = db.marks.find((m) => m.examId === report.examId && m.subjectId === report.subjectId && m.studentId === report.studentId);
    if (mark && (actionTaken === "Exonerated" || actionTaken === "Warning Issued")) mark.status = "approved";
    if (mark && actionTaken === "Exam Cancelled") {
      mark.totalMarks = 0;
      mark.status = "withheld";
      mark.remarks = "Exam cancelled by the Head of Examination disciplinary board.";
    }

    const student = findStudent(db, report.studentId);
    audit(db, {
      userId: "usr_head",
      userName: reviewerName || HEAD_NAME,
      action: "MALPRACTICE_DECISION_RECORDED",
      entityType: "malpractice",
      entityId: reportId,
      details: `Decision for ${student?.fullName}: ${actionTaken}. ${headDecision || ""}`.trim(),
    });
    if (student?.userId) {
      notify(db, {
        userId: student.userId,
        title: "Disciplinary Board Decision Recorded",
        message: `Decision on incident report: ${actionTaken}. Remarks: ${headDecision || "Review complete."}`,
        type: actionTaken === "Exonerated" ? "success" : "warning",
      });
    }
    saveDB();
    return ok({ success: true, message: "Malpractice decision saved successfully" });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Revaluation                                                         */
/* ------------------------------------------------------------------ */
const revaluation: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    const studentId = url.searchParams.get("studentId");
    const teacherId = url.searchParams.get("teacherId");
    const requests = [...db.revaluationRequests]
      .sort(byNewest("appliedAt"))
      .filter((r) => (!studentId || r.studentId === studentId) && (!teacherId || r.assignedTeacherId === teacherId))
      .map((r) => ({
        ...r,
        student: findStudent(db, r.studentId),
        subject: findSubject(db, r.subjectId),
        exam: db.exams.find((e) => e.id === r.examId),
        assignedTeacherName: db.users.find((u) => u.id === r.assignedTeacherId)?.name || "Unassigned",
      }));
    return ok({ success: true, requests });
  }

  if (method === "POST") {
    const { examId, subjectId, studentId, originalMarks, reason, applicantName } = body || {};
    if (!examId || !subjectId || !studentId || !reason) return fail(400, "examId, subjectId, studentId, and reason are required");
    if (db.revaluationRequests.some((r) => r.examId === examId && r.subjectId === subjectId && r.studentId === studentId))
      return fail(400, "You have already submitted a revaluation request for this subject.");

    const mark = db.marks.find((m) => m.examId === examId && m.subjectId === subjectId && m.studentId === studentId);
    const id = uid("reval");
    db.revaluationRequests.push({
      id,
      examId,
      subjectId,
      studentId,
      originalMarks: mark ? mark.totalMarks : Number(originalMarks) || 0,
      revisedMarks: null,
      reason,
      status: "applied",
      assignedTeacherId: null,
      teacherRemarks: null,
      headRemarks: null,
      feePaid: true,
      appliedAt: now(),
      resolvedAt: null,
    });

    const subject = findSubject(db, subjectId);
    notify(db, {
      userId: "usr_head",
      title: "New Revaluation Appeal Received",
      message: `${applicantName || "A student"} applied for revaluation in ${subject?.code || "a subject"}.`,
      link: "/head/revaluation",
    });
    audit(db, {
      userId: findStudent(db, studentId)?.userId || null,
      userName: applicantName || "Student",
      action: "REVALUATION_APPLIED",
      entityType: "revaluation",
      entityId: id,
      details: `Applied for revaluation in ${subject?.code || subjectId}.`,
    });
    saveDB();
    return ok({ success: true, requestId: id, message: "Revaluation application submitted and sent to the Head of Examination." });
  }

  if (method === "PATCH") {
    const { requestId, action, assignedTeacherId, headRemarks, revisedMarks, teacherRemarks, actorName } = body || {};
    const reval = db.revaluationRequests.find((r) => r.id === requestId);
    if (!reval) return fail(404, "Revaluation request not found");
    const student = findStudent(db, reval.studentId);
    const subject = findSubject(db, reval.subjectId);

    if (action === "head_assign") {
      reval.status = "under_review";
      reval.assignedTeacherId = assignedTeacherId || null;
      reval.headRemarks = headRemarks || "Assigned for re-evaluation by Head.";
      if (assignedTeacherId)
        notify(db, {
          userId: assignedTeacherId,
          title: "Revaluation Appeal Assigned",
          message: `You have been assigned re-evaluation for ${student?.fullName} (${subject?.code}).`,
          type: "warning",
          link: "/teacher/revaluation",
        });
      if (student?.userId)
        notify(db, {
          userId: student.userId,
          title: "Revaluation Approved & Under Review",
          message: `Your revaluation application for ${subject?.code} is now under review.`,
          link: "/student/revaluation",
        });
      audit(db, {
        userId: "usr_head",
        userName: actorName || HEAD_NAME,
        action: "REVALUATION_ASSIGNED",
        entityType: "revaluation",
        entityId: requestId,
        details: `Assigned revaluation for ${student?.fullName} in ${subject?.code} to ${db.users.find((u) => u.id === assignedTeacherId)?.name || "an evaluator"}.`,
      });
      saveDB();
      return ok({ success: true, message: "Revaluation approved and assigned to evaluator." });
    }

    if (action === "head_reject") {
      reval.status = "rejected";
      reval.headRemarks = headRemarks || "Rejected by Head of Examination.";
      reval.resolvedAt = now();
      if (student?.userId)
        notify(db, {
          userId: student.userId,
          title: "Revaluation Request Rejected",
          message: `Your revaluation request for ${subject?.code} was rejected. Remarks: ${reval.headRemarks}`,
          type: "warning",
          link: "/student/revaluation",
        });
      audit(db, {
        userId: "usr_head",
        userName: actorName || HEAD_NAME,
        action: "REVALUATION_REJECTED",
        entityType: "revaluation",
        entityId: requestId,
        details: `Rejected revaluation for ${student?.fullName} in ${subject?.code}.`,
      });
      saveDB();
      return ok({ success: true, message: "Revaluation request rejected." });
    }

    if (action === "teacher_evaluate") {
      const revised = Number(revisedMarks);
      if (Number.isNaN(revised)) return fail(400, "Valid revisedMarks is required");
      if (subject && (revised < 0 || revised > subject.maxMarks)) return fail(400, `Revised marks must be between 0 and ${subject.maxMarks}.`);

      reval.status = "completed";
      reval.revisedMarks = revised;
      reval.teacherRemarks = teacherRemarks || "Re-evaluation completed.";
      reval.resolvedAt = now();

      const mark = db.marks.find((m) => m.examId === reval.examId && m.subjectId === reval.subjectId && m.studentId === reval.studentId);
      if (mark) {
        mark.totalMarks = revised;
        mark.status = "approved";
        mark.remarks = `[Revaluation]: ${reval.originalMarks} → ${revised}. ${teacherRemarks || ""}`.trim();
      }

      notify(db, {
        userId: "usr_head",
        title: `Revaluation Completed for ${student?.fullName}`,
        message: `${actorName || "Evaluator"} finished revaluation for ${subject?.code}: ${reval.originalMarks} → ${revised}.`,
        type: "success",
        link: "/head/revaluation",
      });
      if (student?.userId)
        notify(db, {
          userId: student.userId,
          title: "Revaluation Outcome Published!",
          message: `Your revaluation for ${subject?.code} is complete. Score updated: ${reval.originalMarks} → ${revised}.`,
          type: "success",
          link: "/student/revaluation",
        });
      audit(db, {
        userId: null,
        userName: actorName || "Evaluator",
        action: "REVALUATION_COMPLETED",
        entityType: "revaluation",
        entityId: requestId,
        details: `Re-evaluated ${student?.fullName} in ${subject?.code}: ${reval.originalMarks} → ${revised}.`,
      });
      saveDB();
      return ok({ success: true, message: "Revaluation completed and marks updated!" });
    }

    return fail(400, "Invalid action");
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */
function grade(pct: number) {
  if (pct >= 90) return { grade: "O", points: 10, label: "Outstanding" };
  if (pct >= 80) return { grade: "A+", points: 9, label: "Excellent" };
  if (pct >= 70) return { grade: "A", points: 8, label: "Very Good" };
  if (pct >= 60) return { grade: "B+", points: 7, label: "Good" };
  if (pct >= 50) return { grade: "B", points: 6, label: "Above Average" };
  if (pct >= 40) return { grade: "C", points: 5, label: "Pass" };
  return { grade: "F", points: 0, label: "Fail" };
}

const results: Handler = ({ url }) => {
  const db = getDB();
  const reg = url.searchParams.get("registerNumber");
  const sid = url.searchParams.get("studentId");
  const examParam = url.searchParams.get("examId");

  const student = reg
    ? db.students.find((s) => s.registerNumber && s.registerNumber.toUpperCase() === reg.trim().toUpperCase())
    : sid
    ? findStudent(db, sid)
    : undefined;
  if (!student) return fail(404, "Student not found with provided register number");

  const exam =
    (examParam && db.exams.find((e) => e.id === examParam)) ||
    db.exams.find((e) => e.id === "exam_autumn2025") ||
    [...db.exams].sort(byNewest("createdAt"))[0];
  if (!exam) return fail(404, "Exam not found");

  if (!exam.isResultReleased) {
    return ok({
      success: true,
      isReleased: false,
      examTitle: exam.title,
      message: `Results for ${exam.title} have not been released yet by the Head of Examination. Please check back after the official announcement.`,
    });
  }

  const malp = db.malpracticeReports.find((r) => r.examId === exam.id && r.studentId === student.id);
  const isWithheld = Boolean(
    malp && (malp.status === "reported" || malp.status === "under_review" || malp.actionTaken === "Marks Withheld")
  );

  const examSubjects = db.subjects.filter((s) => s.examId === exam.id);
  const studentMarks = db.marks.filter((m) => m.examId === exam.id && m.studentId === student.id);
  const revals = db.revaluationRequests.filter((r) => r.examId === exam.id && r.studentId === student.id);

  let totalMax = 0;
  let totalObt = 0;
  let totalPoints = 0;
  let failedAny = false;

  const subjects = examSubjects.map((sub) => {
    const m = studentMarks.find((x) => x.subjectId === sub.id);
    const obtained = m ? m.totalMarks : 0;
    const isAbsent = m ? m.isAbsent : false;
    const markStatus = m ? m.status : "pending";
    const g = isAbsent ? { grade: "AB", points: 0, label: "Absent" } : grade((obtained / sub.maxMarks) * 100);
    const passed = !isAbsent && obtained >= sub.passMarks && markStatus !== "withheld";
    if (!passed) failedAny = true;
    totalMax += sub.maxMarks;
    totalObt += obtained;
    totalPoints += g.points;
    return {
      subjectId: sub.id,
      code: sub.code,
      name: sub.name,
      date: sub.date,
      maxMarks: sub.maxMarks,
      passMarks: sub.passMarks,
      theoryMarks: m?.theoryMarks ?? 0,
      practicalMarks: m?.practicalMarks ?? 0,
      totalMarks: obtained,
      isAbsent,
      grade: markStatus === "withheld" ? "WH" : g.grade,
      gradeLabel: markStatus === "withheld" ? "Withheld" : g.label,
      gradePoints: g.points,
      status: markStatus === "withheld" ? "WITHHELD" : passed ? "PASS" : "FAIL",
      remarks: m?.remarks || null,
      revaluation: revals.find((r) => r.subjectId === sub.id) || null,
      isRevaluationEligible: !isWithheld && markStatus !== "withheld",
    };
  });

  const overallPercentage = totalMax > 0 ? Number(((totalObt / totalMax) * 100).toFixed(2)) : 0;
  const cgpa = examSubjects.length ? Number((totalPoints / examSubjects.length).toFixed(2)) : 0;
  const overallResult = isWithheld ? "WITHHELD" : failedAny ? "FAILED" : "PASSED";
  let division = "FAIL";
  if (overallResult === "PASSED") {
    division =
      overallPercentage >= 75 ? "FIRST CLASS WITH DISTINCTION" : overallPercentage >= 60 ? "FIRST CLASS" : overallPercentage >= 50 ? "SECOND CLASS" : "PASS CLASS";
  }

  return ok({
    success: true,
    isReleased: true,
    isWithheld,
    withheldReason: isWithheld
      ? `Result withheld: the candidate has an active inquiry regarding ${malp?.malpracticeType || "a malpractice incident"} (${malp?.actionTaken || "Under Investigation"}).`
      : null,
    exam,
    student,
    subjects,
    summary: { totalMaxMarks: totalMax, totalObtainedMarks: totalObt, overallPercentage, cgpa, overallResult, division },
  });
};

/* ------------------------------------------------------------------ */
/* Audit logs & notifications                                          */
/* ------------------------------------------------------------------ */
const auditLogs: Handler = ({ url }) => {
  const db = getDB();
  const limit = Number(url.searchParams.get("limit")) || 100;
  return ok({ success: true, logs: [...db.auditLogs].sort(byNewest("createdAt")).slice(0, limit) });
};

const notifications: Handler = ({ method, url, body }) => {
  const db = getDB();

  if (method === "GET") {
    const userId = url.searchParams.get("userId");
    const items = db.notifications
      .filter((n) => !userId || n.userId === userId || n.userId === null)
      .sort(byNewest("createdAt"))
      .slice(0, 30);
    return ok({ success: true, notifications: items, unreadCount: items.filter((n) => !n.isRead).length });
  }

  if (method === "PATCH") {
    const { notificationId, markAllRead, userId } = body || {};
    db.notifications.forEach((n) => {
      if ((markAllRead && userId && (n.userId === userId || n.userId === null)) || n.id === notificationId) n.isRead = true;
    });
    saveDB();
    return ok({ success: true, message: "Notifications updated" });
  }

  return fail(405, "Method not allowed");
};

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */
const routes: Record<string, Handler> = {
  "/api/seed": seed,
  "/api/auth/login": login,
  "/api/auth/reset-password": resetPassword,
  "/api/head/registrations": registrations,
  "/api/head/users": staffUsers,
  "/api/head/exams": exams,
  "/api/attendance": attendance,
  "/api/answer-papers": answerPapers,
  "/api/marks": marks,
  "/api/malpractice": malpractice,
  "/api/revaluation": revaluation,
  "/api/results": results,
  "/api/audit-logs": auditLogs,
  "/api/notifications": notifications,
};

/** Returns null when the path is not a mocked endpoint. */
export async function handleMockRequest(method: string, url: URL, body: unknown): Promise<MockResponse | null> {
  const idx = url.pathname.indexOf("/api/");
  if (idx === -1) return null;
  const path = url.pathname.slice(idx).replace(/\/+$/, "");
  const handler = routes[path];
  if (!handler) return null;
  try {
    return await handler({ method: method.toUpperCase(), url, body });
  } catch (e) {
    console.error("Mock API error:", e);
    return fail(500, e instanceof Error ? e.message : "Unexpected error");
  }
}
