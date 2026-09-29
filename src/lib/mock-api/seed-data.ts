// Initial demo data for the browser-only SFS College examination system.
export type Row = Record<string, any>;
export interface SeedTables {
  users: Row[];
  students: Row[];
  halls: Row[];
  exams: Row[];
  subjects: Row[];
  examRegistrations: Row[];
  attendance: Row[];
  answerPapers: Row[];
  marks: Row[];
  malpracticeReports: Row[];
  revaluationRequests: Row[];
  auditLogs: Row[];
  notifications: Row[];
  generatedPdfs: Row[];
}


const createAnswerSheetSvg = (title: string, pageNum: number, studentName: string, regNo: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <rect width="600" height="850" fill="#09090b" stroke="#27272a" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="90" fill="#18181b" stroke="#3f3f46" rx="6"/>
    <text x="300" y="48" font-family="monospace" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">SFS COLLEGE EXAMINATION BOARD</text>
    <text x="300" y="68" font-family="sans-serif" font-size="11" fill="#a1a1aa" text-anchor="middle">Official Verified Main Script Archive</text>
    <line x1="20" y1="80" x2="580" y2="80" stroke="#27272a"/>
    <text x="35" y="98" font-family="monospace" font-size="11" fill="#e4e4e7"><tspan font-weight="bold">REG NO:</tspan> ${regNo}</text>
    <text x="210" y="98" font-family="sans-serif" font-size="11" fill="#e4e4e7"><tspan font-weight="bold">CANDIDATE:</tspan> ${studentName}</text>
    <text x="490" y="98" font-family="monospace" font-size="11" fill="#38bdf8" font-weight="bold">Page ${pageNum} of 3</text>
    
    <g stroke="#27272a" stroke-width="1">
      <line x1="70" y1="120" x2="70" y2="810" stroke="#52525b" stroke-width="1.5" />
      ${Array.from({ length: 24 }).map((_, i) => `<line x1="20" y1="${150 + i * 27}" x2="580" y2="${150 + i * 27}" />`).join("")}
    </g>

    <text x="35" y="148" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Q.${pageNum}</text>
    <text x="85" y="146" font-family="sans-serif" font-size="13" fill="#ffffff" font-weight="bold">${title}</text>
    <text x="85" y="173" font-family="sans-serif" font-size="12" fill="#d4d4d8">In relational databases, Normalization is the formal process of structuring a</text>
    <text x="85" y="200" font-family="sans-serif" font-size="12" fill="#d4d4d8">relational database according to normal forms (1NF, 2NF, 3NF, BCNF)</text>
    <text x="85" y="227" font-family="sans-serif" font-size="12" fill="#d4d4d8">to eliminate anomalies and maintain integrity. Functional dependencies:</text>
    <text x="100" y="254" font-family="monospace" font-size="11" fill="#38bdf8">X → Y holds if each X value strictly determines Y.</text>
    <text x="85" y="281" font-family="sans-serif" font-size="12" fill="#d4d4d8">ACID properties in database transaction management:</text>
    <text x="100" y="308" font-family="sans-serif" font-size="12" fill="#a1a1aa">• Atomicity: Complete transaction commitment or total rollback</text>
    <text x="100" y="335" font-family="sans-serif" font-size="12" fill="#a1a1aa">• Consistency: Preserves schema integrity invariants</text>
    <text x="100" y="362" font-family="sans-serif" font-size="12" fill="#a1a1aa">• Isolation: Serializability guaranteed during concurrency</text>
    <text x="100" y="389" font-family="sans-serif" font-size="12" fill="#a1a1aa">• Durability: Committed write-ahead logging (WAL) persistence</text>

    <rect x="420" y="730" width="140" height="70" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="4" rx="4"/>
    <text x="490" y="752" font-family="sans-serif" font-size="11" font-weight="bold" fill="#22c55e" text-anchor="middle">EXAM EVALUATED</text>
    <text x="490" y="772" font-family="sans-serif" font-size="15" font-weight="bold" fill="#22c55e" text-anchor="middle">Marks: 18 / 20</text>
    <text x="490" y="790" font-family="sans-serif" font-size="10" fill="#22c55e" text-anchor="middle">Santhosh Kumar [Sign]</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function createSeedData(): SeedTables {

  // 1. Insert Enrolled Users
  const userList = [
    {
      id: "usr_head",
      email: "annie.christila@sfscollege.edu",
      username: "examhead",
      passwordHash: "password123",
      name: "Dr. Annie Christila S.",
      phone: "+91 98450 12345",
      role: "head",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_teacher_santhosh",
      email: "santhosh.kumar@sfscollege.edu",
      username: "santhosh_kumar",
      passwordHash: "password123",
      name: "Santhosh Kumar",
      phone: "+91 98450 23456",
      role: "staff",
      isTeacher: true,
      isInvigilator: true,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_staff_sailaja",
      email: "sailaja.mulakaluri@sfscollege.edu",
      username: "sailaja_mulakaluri",
      passwordHash: "password123",
      name: "Dr. Sailaja Mulakaluri",
      phone: "+91 98450 34567",
      role: "staff",
      isTeacher: true,
      isInvigilator: true,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_staff_akhil",
      email: "akhil.kumar@sfscollege.edu",
      username: "akhil_kumar",
      passwordHash: "password123",
      name: "Mr. Akhil Kumar K M",
      phone: "+91 98450 45678",
      role: "staff",
      isTeacher: true,
      isInvigilator: true,
      avatarUrl: null,
      status: "active",
    },
    // Enrolled College Students
    {
      id: "usr_stu_alex",
      email: "joy.adhikari@sfscollege.edu",
      username: "U03ZW25S0092",
      passwordHash: "password123",
      name: "Joy Adhikari",
      phone: "+91 90080 10092",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_stu_priya",
      email: "vishnu@sfscollege.edu",
      username: "U03ZW25S0143",
      passwordHash: "password123",
      name: "Vishnu",
      phone: "+91 90080 10143",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_stu_david",
      email: "sahithi@sfscollege.edu",
      username: "U03ZW25S0104",
      passwordHash: "password123",
      name: "Sahithi",
      phone: "+91 90080 10104",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_stu_lucas",
      email: "mary@sfscollege.edu",
      username: "U03ZW25S0149",
      passwordHash: "password123",
      name: "Mary",
      phone: "+91 90080 10149",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_stu_emma",
      email: "ruba@sfscollege.edu",
      username: "U03ZW25S0199",
      passwordHash: "password123",
      name: "Ruba",
      phone: "+91 90080 10199",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
    {
      id: "usr_stu_amina",
      email: "kavya@sfscollege.edu",
      username: "U03ZW25S0045",
      passwordHash: "password123",
      name: "Kavya",
      phone: "+91 90080 10045",
      role: "student",
      isTeacher: false,
      isInvigilator: false,
      avatarUrl: null,
      status: "active",
    },
  ];


  // 2. Insert Enrolled College Students in Registry
  const studentList = [
    {
      id: "stu_1",
      userId: "usr_stu_alex",
      registerNumber: "U03ZW25S0092",
      applicationNumber: "COL-CSE-2023-01",
      fullName: "Joy Adhikari",
      email: "joy.adhikari@sfscollege.edu",
      phone: "+91 90080 10092",
      dateOfBirth: "2003-04-14",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-10"),
    },
    {
      id: "stu_2",
      userId: "usr_stu_priya",
      registerNumber: "U03ZW25S0143",
      applicationNumber: "COL-CSE-2023-02",
      fullName: "Vishnu",
      email: "vishnu@sfscollege.edu",
      phone: "+91 90080 10143",
      dateOfBirth: "2003-08-22",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-10"),
    },
    {
      id: "stu_3",
      userId: "usr_stu_david",
      registerNumber: "U03ZW25S0104",
      applicationNumber: "COL-CSE-2023-03",
      fullName: "Sahithi",
      email: "sahithi@sfscollege.edu",
      phone: "+91 90080 10104",
      dateOfBirth: "2002-11-05",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-11"),
    },
    {
      id: "stu_4",
      userId: "usr_stu_lucas",
      registerNumber: "U03ZW25S0149",
      applicationNumber: "COL-CSE-2023-04",
      fullName: "Mary",
      email: "mary@sfscollege.edu",
      phone: "+91 90080 10149",
      dateOfBirth: "2003-02-19",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-12"),
    },
    {
      id: "stu_5",
      userId: "usr_stu_emma",
      registerNumber: "U03ZW25S0199",
      applicationNumber: "COL-CSE-2023-05",
      fullName: "Ruba",
      email: "ruba@sfscollege.edu",
      phone: "+91 90080 10199",
      dateOfBirth: "2003-09-30",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-12"),
    },
    {
      id: "stu_6",
      userId: "usr_stu_amina",
      registerNumber: "U03ZW25S0045",
      applicationNumber: "COL-CSE-2023-06",
      fullName: "Kavya",
      email: "kavya@sfscollege.edu",
      phone: "+91 90080 10045",
      dateOfBirth: "2004-01-15",
      course: "B.Tech Computer Science & Engineering",
      semester: 5,
      photoUrl: null,
      documentUrl: null,
      status: "approved",
      approvedAt: new Date("2025-08-12"),
    },
  ];


  // 3. Insert Halls
  const hallList = [
    {
      id: "hall_101",
      name: "Hall 101 - Main Academic Block",
      capacity: 50,
      location: "Building A, 1st Floor",
    },
    {
      id: "hall_204",
      name: "Hall 204 - Science & Computing Wing",
      capacity: 65,
      location: "Building C, 2nd Floor",
    },
    {
      id: "hall_305",
      name: "Hall 305 - Examination Annex",
      capacity: 40,
      location: "Building D, Ground Floor",
    },
  ];


  // 4. Insert Exams
  const examList = [
    {
      id: "exam_autumn2025",
      title: "Semester End Examinations - Autumn 2025",
      academicYear: "2025-2026",
      semester: 5,
      startDate: "2025-11-10",
      endDate: "2025-11-28",
      isResultReleased: true,
      resultReleasedAt: new Date("2025-12-15"),
      revaluationDeadline: "2026-04-30",
      revaluationFee: 25,
      status: "results_published",
    },
    {
      id: "exam_spring2026",
      title: "Spring 2026 Mid-Semester Assessment",
      academicYear: "2025-2026",
      semester: 6,
      startDate: "2026-03-20",
      endDate: "2026-04-05",
      isResultReleased: false,
      resultReleasedAt: null,
      revaluationDeadline: null,
      revaluationFee: 25,
      status: "active",
    },
  ];


  // 5. Insert Subjects
  const subjectList = [
    {
      id: "subj_cs301",
      examId: "exam_autumn2025",
      code: "CS301",
      name: "Database Management Systems & Cloud Architecture",
      date: "2025-11-12",
      startTime: "09:30 AM",
      endTime: "12:30 PM",
      hallId: "hall_101",
      maxMarks: 100,
      passMarks: 40,
      assignedTeacherId: "usr_teacher_santhosh",
      assignedInvigilatorId: "usr_staff_sailaja",
      marksSubmissionStatus: "submitted",
      submittedAt: new Date("2025-11-20"),
    },
    {
      id: "subj_cs302",
      examId: "exam_autumn2025",
      code: "CS302",
      name: "Compiler Design & Automata Theory",
      date: "2025-11-15",
      startTime: "09:30 AM",
      endTime: "12:30 PM",
      hallId: "hall_101",
      maxMarks: 100,
      passMarks: 40,
      assignedTeacherId: "usr_staff_akhil",
      assignedInvigilatorId: "usr_staff_sailaja",
      marksSubmissionStatus: "submitted",
      submittedAt: new Date("2025-11-22"),
    },
    {
      id: "subj_cs303",
      examId: "exam_autumn2025",
      code: "CS303",
      name: "Computer Networks & Distributed Protocols",
      date: "2025-11-18",
      startTime: "09:30 AM",
      endTime: "12:30 PM",
      hallId: "hall_204",
      maxMarks: 100,
      passMarks: 40,
      assignedTeacherId: "usr_teacher_santhosh",
      assignedInvigilatorId: "usr_staff_akhil",
      marksSubmissionStatus: "submitted",
      submittedAt: new Date("2025-11-25"),
    },
    {
      id: "subj_cs304",
      examId: "exam_autumn2025",
      code: "CS304",
      name: "Software Engineering & Agile Methodologies",
      date: "2025-11-21",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      hallId: "hall_101",
      maxMarks: 100,
      passMarks: 40,
      assignedTeacherId: "usr_staff_akhil",
      assignedInvigilatorId: "usr_staff_sailaja",
      marksSubmissionStatus: "submitted",
      submittedAt: new Date("2025-11-26"),
    },
    {
      id: "subj_cs305",
      examId: "exam_spring2026",
      code: "CS305",
      name: "Artificial Intelligence & Heuristic Search",
      date: "2026-03-24",
      startTime: "09:30 AM",
      endTime: "12:30 PM",
      hallId: "hall_101",
      maxMarks: 100,
      passMarks: 40,
      assignedTeacherId: "usr_teacher_santhosh",
      assignedInvigilatorId: "usr_staff_sailaja",
      marksSubmissionStatus: "draft",
      submittedAt: null,
    },
  ];


  // 6. Exam Registrations (Hall tickets)
  const regList = [
    {
      id: "reg_alex_autumn",
      studentId: "stu_1",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-001",
      seatNumber: "A-12",
    },
    {
      id: "reg_priya_autumn",
      studentId: "stu_2",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-002",
      seatNumber: "A-14",
    },
    {
      id: "reg_david_autumn",
      studentId: "stu_3",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-003",
      seatNumber: "A-16",
    },
    {
      id: "reg_lucas_autumn",
      studentId: "stu_4",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-004",
      seatNumber: "A-18",
    },
    {
      id: "reg_emma_autumn",
      studentId: "stu_5",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-005",
      seatNumber: "A-20",
    },
    {
      id: "reg_kavya_autumn",
      studentId: "stu_6",
      examId: "exam_autumn2025",
      hallTicketNumber: "HT-2025-CSE-006",
      seatNumber: "A-22",
    },
  ];


  // 7. Attendance
  const attendanceList = [
    {
      id: "att_cs301_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_1",
      status: "present",
      markedById: "usr_staff_sailaja",
      notes: "Arrived on time. ID verified.",
    },
    {
      id: "att_cs301_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_2",
      status: "present",
      markedById: "usr_staff_sailaja",
      notes: "Present in Seat A-14.",
    },
    {
      id: "att_cs301_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_3",
      status: "present",
      markedById: "usr_staff_sailaja",
      notes: "Present in Seat A-16.",
    },
    {
      id: "att_cs301_stu4",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_4",
      status: "present",
      markedById: "usr_staff_sailaja",
      notes: "Present. Malpractice incident reported during exam.",
    },
    {
      id: "att_cs301_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_5",
      status: "present",
      markedById: "usr_staff_sailaja",
      notes: "Present in Seat A-20.",
    },
    // CS302 Attendance
    {
      id: "att_cs302_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_1",
      status: "present",
      markedById: "usr_staff_sailaja",
    },
    {
      id: "att_cs302_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_2",
      status: "present",
      markedById: "usr_staff_sailaja",
    },
    {
      id: "att_cs302_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_3",
      status: "present",
      markedById: "usr_staff_sailaja",
    },
    {
      id: "att_cs302_stu4",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_4",
      status: "absent",
      markedById: "usr_staff_sailaja",
      notes: "Absent.",
    },
    {
      id: "att_cs302_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_5",
      status: "present",
      markedById: "usr_staff_sailaja",
    },

    {
      id: "att_cs301_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_6",
      status: "present",
      markedById: "usr_staff_sailaja",
    },
    {
      id: "att_cs302_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_6",
      status: "present",
      markedById: "usr_staff_sailaja",
    },
  ];


  // 8. Answer Papers
  const answerPaperList = [
    {
      id: "ap_cs301_alex",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_1",
      pages: JSON.stringify([
        createAnswerSheetSvg("Database Architecture & Normalization", 1, "Joy Adhikari", "U03ZW25S0092"),
        createAnswerSheetSvg("B+ Tree Indexing & Query Execution", 2, "Joy Adhikari", "U03ZW25S0092"),
        createAnswerSheetSvg("Concurrency Control & 2PL Protocol", 3, "Joy Adhikari", "U03ZW25S0092"),
      ]),
      uploadedById: "usr_staff_sailaja",
      totalPages: 3,
      notes: "Clean answer sheet bundle, 3 booklets submitted.",
    },
    {
      id: "ap_cs301_priya",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_2",
      pages: JSON.stringify([
        createAnswerSheetSvg("Database Architecture & Normalization", 1, "Vishnu", "U03ZW25S0143"),
        createAnswerSheetSvg("B+ Tree Indexing & Query Execution", 2, "Vishnu", "U03ZW25S0143"),
      ]),
      uploadedById: "usr_staff_sailaja",
      totalPages: 2,
      notes: "2 pages attached.",
    },
    {
      id: "ap_cs301_david",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_3",
      pages: JSON.stringify([
        createAnswerSheetSvg("Database Architecture & Normalization", 1, "Sahithi", "U03ZW25S0104"),
        createAnswerSheetSvg("B+ Tree Indexing & Query Execution", 2, "Sahithi", "U03ZW25S0104"),
      ]),
      uploadedById: "usr_staff_sailaja",
      totalPages: 2,
      notes: "2 pages verified.",
    },
    {
      id: "ap_cs301_lucas",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_4",
      pages: JSON.stringify([
        createAnswerSheetSvg("Database Architecture & Normalization", 1, "Mary", "U03ZW25S0149"),
      ]),
      uploadedById: "usr_staff_sailaja",
      totalPages: 1,
      notes: "Confiscated by invigilator due to unauthorized material.",
    },
    {
      id: "ap_cs301_emma",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_5",
      pages: JSON.stringify([
        createAnswerSheetSvg("Database Architecture & Normalization", 1, "Ruba", "U03ZW25S0199"),
        createAnswerSheetSvg("B+ Tree Indexing & Query Execution", 2, "Ruba", "U03ZW25S0199"),
        createAnswerSheetSvg("Concurrency Control & 2PL Protocol", 3, "Ruba", "U03ZW25S0199"),
      ]),
      uploadedById: "usr_staff_sailaja",
      totalPages: 3,
      notes: "3 booklets scanned.",
    },
  ];


  // 9. Marks
  const marksList = [
    // CS301 marks
    {
      id: "mark_cs301_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_1",
      theoryMarks: 68,
      practicalMarks: 24,
      totalMarks: 92,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-20"),
      remarks: "Exceptional clarity in transaction management theorems.",
    },
    {
      id: "mark_cs301_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_2",
      theoryMarks: 58,
      practicalMarks: 22,
      totalMarks: 80,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-20"),
      remarks: "Good solutions. Well-structured ER diagram.",
    },
    {
      id: "mark_cs301_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_3",
      theoryMarks: 48,
      practicalMarks: 20,
      totalMarks: 68,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-20"),
      remarks: "Satisfactory performance.",
    },
    {
      id: "mark_cs301_stu4",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_4",
      theoryMarks: 0,
      practicalMarks: 0,
      totalMarks: 0,
      isAbsent: false,
      status: "withheld",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-20"),
      remarks: "Result Withheld pending Central Malpractice Committee adjudication.",
    },
    {
      id: "mark_cs301_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_5",
      theoryMarks: 22,
      practicalMarks: 14,
      totalMarks: 36,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-20"),
      remarks: "Candidate missed derivation in Question 4. Total below passing mark of 40.",
    },
    // CS302 marks
    {
      id: "mark_cs302_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_1",
      theoryMarks: 64,
      practicalMarks: 25,
      totalMarks: 89,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-22"),
      remarks: "Accurate LR parser construction tables.",
    },
    {
      id: "mark_cs302_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_2",
      theoryMarks: 60,
      practicalMarks: 24,
      totalMarks: 84,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-22"),
      remarks: "Strong theoretical grasp of syntax-directed translation.",
    },
    {
      id: "mark_cs302_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_3",
      theoryMarks: 50,
      practicalMarks: 22,
      totalMarks: 72,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-22"),
      remarks: "Good work.",
    },
    {
      id: "mark_cs302_stu4",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_4",
      theoryMarks: 0,
      practicalMarks: 0,
      totalMarks: 0,
      isAbsent: true,
      status: "withheld",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-22"),
      remarks: "Absent. Withheld.",
    },
    {
      id: "mark_cs302_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_5",
      theoryMarks: 54,
      practicalMarks: 21,
      totalMarks: 75,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-22"),
      remarks: "Passed with distinction.",
    },
    // CS303 marks
    {
      id: "mark_cs303_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs303",
      studentId: "stu_1",
      theoryMarks: 66,
      practicalMarks: 25,
      totalMarks: 91,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-25"),
    },
    {
      id: "mark_cs303_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs303",
      studentId: "stu_2",
      theoryMarks: 56,
      practicalMarks: 21,
      totalMarks: 77,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-25"),
    },
    {
      id: "mark_cs303_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs303",
      studentId: "stu_3",
      theoryMarks: 52,
      practicalMarks: 23,
      totalMarks: 75,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-25"),
    },
    {
      id: "mark_cs303_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs303",
      studentId: "stu_5",
      theoryMarks: 58,
      practicalMarks: 22,
      totalMarks: 80,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-25"),
    },
    // CS304 marks
    {
      id: "mark_cs304_stu1",
      examId: "exam_autumn2025",
      subjectId: "subj_cs304",
      studentId: "stu_1",
      theoryMarks: 62,
      practicalMarks: 26,
      totalMarks: 88,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
      remarks: "Excellent project architecture design document.",
    },
    {
      id: "mark_cs304_stu2",
      examId: "exam_autumn2025",
      subjectId: "subj_cs304",
      studentId: "stu_2",
      theoryMarks: 54,
      practicalMarks: 24,
      totalMarks: 78,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
    },
    {
      id: "mark_cs304_stu3",
      examId: "exam_autumn2025",
      subjectId: "subj_cs304",
      studentId: "stu_3",
      theoryMarks: 50,
      practicalMarks: 22,
      totalMarks: 72,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
    },
    {
      id: "mark_cs304_stu5",
      examId: "exam_autumn2025",
      subjectId: "subj_cs304",
      studentId: "stu_5",
      theoryMarks: 52,
      practicalMarks: 23,
      totalMarks: 75,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
    },

    {
      id: "mark_cs301_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_6",
      theoryMarks: 60,
      practicalMarks: 23,
      totalMarks: 83,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-26"),
    },
    {
      id: "mark_cs302_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs302",
      studentId: "stu_6",
      theoryMarks: 57,
      practicalMarks: 24,
      totalMarks: 81,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
    },
    {
      id: "mark_cs303_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs303",
      studentId: "stu_6",
      theoryMarks: 62,
      practicalMarks: 22,
      totalMarks: 84,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_teacher_santhosh",
      evaluatedAt: new Date("2025-11-26"),
    },
    {
      id: "mark_cs304_stu6",
      examId: "exam_autumn2025",
      subjectId: "subj_cs304",
      studentId: "stu_6",
      theoryMarks: 59,
      practicalMarks: 25,
      totalMarks: 84,
      isAbsent: false,
      status: "approved",
      evaluatedById: "usr_staff_akhil",
      evaluatedAt: new Date("2025-11-26"),
    },
  ];


  // 10. Malpractice Report
  const malpracticeList = [
    {
      id: "malp_2025_001",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_4",
      reportedById: "usr_staff_sailaja",
      incidentTime: new Date("2025-11-12T10:42:00Z"),
      malpracticeType: "Possession of Unauthorized Material",
      description:
        "Student Mary was observed retrieving micro-notes containing SQL syntax written on chits during CS301 exam at Hall 101. Invigilator Dr. Sailaja Mulakaluri seized materials and logged report immediately.",
      evidencePhotoUrl: null,
      status: "under_review",
      headDecision: "Candidate summoned for inquiry hearing before the Disciplinary Board. Marks withheld.",
      actionTaken: "Marks Withheld",
      decidedAt: new Date("2025-11-14T14:30:00Z"),
    },
  ];


  // 11. Revaluation Requests
  const revalList = [
    {
      id: "reval_2025_001",
      examId: "exam_autumn2025",
      subjectId: "subj_cs301",
      studentId: "stu_5",
      originalMarks: 36,
      revisedMarks: null,
      reason:
        "In Section B, Question 4 (B+ Tree Splitting & Query Cost Estimation), I wrote the complete 4-step derivation with block transfer arithmetic which meets rubric criteria. Requesting re-evaluation of Question 4.",
      status: "under_review",
      assignedTeacherId: "usr_teacher_santhosh",
      teacherRemarks: "Re-evaluation pending: verified student booklet Question 4.",
      headRemarks: "Approved for senior examiner reassessment. Assigned to Santhosh Kumar.",
      feePaid: true,
      appliedAt: new Date("2025-12-18T09:15:00Z"),
      resolvedAt: null,
    },
  ];


  // 12. Audit Logs
  const auditList = [
    {
      id: "aud_1",
      userId: "usr_head",
      userName: "Dr. Annie Christila S.",
      action: "STUDENT_ENROLLED",
      entityType: "student",
      entityId: "stu_1",
      details: "Enrolled college examinee Joy Adhikari (U03ZW25S0092) in examination registry.",
      createdAt: new Date("2025-08-10T10:00:00Z"),
    },
    {
      id: "aud_2",
      userId: "usr_staff_sailaja",
      userName: "Dr. Sailaja Mulakaluri",
      action: "ATTENDANCE_MARKED",
      entityType: "attendance",
      entityId: "subj_cs301",
      details: "Marked attendance for Hall 101 - CS301 Database Systems (5 candidates present).",
      createdAt: new Date("2025-11-12T09:45:00Z"),
    },
    {
      id: "aud_3",
      userId: "usr_staff_sailaja",
      userName: "Dr. Sailaja Mulakaluri",
      action: "MALPRACTICE_REPORTED",
      entityType: "malpractice",
      entityId: "malp_2025_001",
      details: "Reported unauthorized material malpractice case against Mary (U03ZW25S0149).",
      createdAt: new Date("2025-11-12T10:45:00Z"),
    },
    {
      id: "aud_4",
      userId: "usr_teacher_santhosh",
      userName: "Santhosh Kumar",
      action: "MARK_SUBMITTED",
      entityType: "subject",
      entityId: "subj_cs301",
      details: "Submitted finalized evaluation marks for CS301 Database Management Systems.",
      createdAt: new Date("2025-11-20T16:30:00Z"),
    },
    {
      id: "aud_5",
      userId: "usr_head",
      userName: "Dr. Annie Christila S.",
      action: "RESULT_RELEASED",
      entityType: "exam",
      entityId: "exam_autumn2025",
      details: "Official release of results for Semester End Examinations - Autumn 2025.",
      createdAt: new Date("2025-12-15T11:00:00Z"),
    },
  ];


  // 13. Notifications
  const notifList = [
    {
      id: "notif_head_2",
      userId: "usr_head",
      title: "URGENT: Malpractice Incident Reported",
      message: "Dr. Sailaja Mulakaluri reported unauthorized materials confiscated from Mary during CS301.",
      type: "urgent",
      isRead: false,
      link: "/head/malpractice",
    },
    {
      id: "notif_teacher_1",
      userId: "usr_teacher_santhosh",
      title: "Revaluation Appeal Assigned",
      message: "Ruba's revaluation appeal for CS301 has been assigned to you by Dr. Annie Christila S..",
      type: "warning",
      isRead: false,
      link: "/teacher/revaluation",
    },
    {
      id: "notif_student_1",
      userId: "usr_stu_alex",
      title: "Official Examination Results Released",
      message: "Results for Autumn 2025 Semester End Examinations are now available. You scored Grade A+ (GPA 3.92).",
      type: "success",
      isRead: false,
      link: "/student/results",
    },
  ];


  return {
    users: userList,
    students: studentList,
    halls: hallList,
    exams: examList,
    subjects: subjectList,
    examRegistrations: regList,
    attendance: attendanceList,
    answerPapers: answerPaperList,
    marks: marksList,
    malpracticeReports: malpracticeList,
    revaluationRequests: revalList,
    auditLogs: auditList,
    notifications: notifList,
    generatedPdfs: [],
  };
}
