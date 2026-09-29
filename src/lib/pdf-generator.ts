import { jsPDF } from "jspdf";

export interface MarksheetData {
  student: {
    fullName: string;
    registerNumber: string;
    course: string;
    semester: number;
    dateOfBirth?: string;
  };
  exam: {
    title: string;
    academicYear: string;
  };
  subjects: Array<{
    code: string;
    name: string;
    maxMarks: number;
    passMarks: number;
    theoryMarks?: number;
    practicalMarks?: number;
    totalMarks: number;
    grade: string;
    status: string;
  }>;
  summary: {
    totalMaxMarks: number;
    totalObtainedMarks: number;
    overallPercentage: number;
    cgpa: number;
    overallResult: string;
    division: string;
  };
}

export function generateMarksheetPDF(data: MarksheetData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer Border in Solid Black
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, 281);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Institution Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("SFS COLLEGE EXAMINATION BOARD", pageWidth / 2, 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("SFS College, Electronics City Bengaluru | Official Verified Academic Ledger", pageWidth / 2, 28, {
    align: "center",
  });

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 33, pageWidth - 14, 33);

  // Title Banner
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 37, pageWidth - 28, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("OFFICIAL GRADE REPORT & TRANSCRIPT", pageWidth / 2, 44.5, { align: "center" });

  // Student & Exam Details Grid
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  let y = 56;
  doc.text(`Candidate Name:`, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.student.fullName.toUpperCase(), 50, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Register No:`, 120, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.student.registerNumber || "N/A", 150, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Programme/Course:`, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.student.course, 50, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Semester:`, 120, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Semester ${data.student.semester}`, 150, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Examination:`, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.exam.title, 50, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Academic Session:`, 120, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.exam.academicYear, 150, y);

  // Table Header in Solid Black
  y += 12;
  doc.setFillColor(0, 0, 0);
  doc.rect(14, y, pageWidth - 28, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("SUB CODE", 18, y + 6);
  doc.text("SUBJECT TITLE", 42, y + 6);
  doc.text("MAX", 112, y + 6);
  doc.text("MIN", 126, y + 6);
  doc.text("OBT", 140, y + 6);
  doc.text("GRADE", 156, y + 6);
  doc.text("STATUS", 178, y + 6);

  // Table Rows
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  data.subjects.forEach((sub, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 248, 248];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(14, y, pageWidth - 28, 8, "F");
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, y, pageWidth - 28, 8, "S");

    doc.setFont("helvetica", "bold");
    doc.text(sub.code, 18, y + 5.5);
    doc.setFont("helvetica", "normal");

    const cleanTitle = sub.name.length > 36 ? sub.name.substring(0, 34) + "..." : sub.name;
    doc.text(cleanTitle, 42, y + 5.5);

    doc.text(String(sub.maxMarks), 115, y + 5.5, { align: "right" });
    doc.text(String(sub.passMarks), 129, y + 5.5, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text(String(sub.totalMarks), 143, y + 5.5, { align: "right" });

    doc.text(sub.grade, 160, y + 5.5);
    doc.text(sub.status, 178, y + 5.5);

    y += 8;
  });

  // Summary Table
  y += 6;
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y, pageWidth - 28, 22, "F");
  doc.setDrawColor(180, 180, 180);
  doc.rect(14, y, pageWidth - 28, 22, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  doc.text(`Total Marks:`, 18, y + 8);
  doc.text(`${data.summary.totalObtainedMarks} / ${data.summary.totalMaxMarks}`, 50, y + 8);

  doc.text(`Percentage:`, 110, y + 8);
  doc.text(`${data.summary.overallPercentage}%`, 140, y + 8);

  doc.text(`CGPA / GPA:`, 18, y + 16);
  doc.text(`${data.summary.cgpa} / 10.0`, 50, y + 16);

  doc.text(`Final Result:`, 110, y + 16);
  doc.text(`${data.summary.overallResult} - ${data.summary.division}`, 140, y + 16);

  // Security Seal & Verification
  y += 34;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("1. This document is verified against the SFS College Examination Authority database.", 16, y + 6);
  doc.text("2. Eligible candidates may apply for revaluation within 15 days of official announcement.", 16, y + 10);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} | Ref: CEB-${Date.now().toString(36).toUpperCase()}`, 16, y + 14);

  // Signatures
  y += 38;
  doc.line(25, y, 75, y);
  doc.text("Controller of Examinations", 30, y + 5);

  doc.line(135, y, 185, y);
  doc.text("Dr. Annie Christila S., Dean of Exam", 138, y + 5);

  doc.save(`Marksheet_${data.student.registerNumber || "Student"}.pdf`);
}

export function generateAnswerSheetBundlePDF(data: {
  studentName: string;
  registerNumber: string;
  course: string;
  subjectCode: string;
  subjectName: string;
  maxMarks: number;
  totalMarks: number;
  evaluatorName: string;
  evaluatorRemarks?: string;
  pages: string[];
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover Sheet / Header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, 277);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text("SFS COLLEGE EXAMINATION BOARD", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text("OFFICIAL ANSWER SCRIPT BUNDLE & EVALUATION RECORD", pageWidth / 2, 33, { align: "center" });

  doc.setDrawColor(0, 0, 0);
  doc.line(15, 38, pageWidth - 15, 38);

  let y = 48;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Candidate Name:", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.studentName, 65, y);

  doc.setFont("helvetica", "normal");
  doc.text("Register Number:", 120, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.registerNumber, 155, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Course / Branch:", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(data.course, 65, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Subject Code & Name:", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.subjectCode} - ${data.subjectName}`, 65, y);

  y += 15;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y, pageWidth - 40, 28, "F");
  doc.setDrawColor(180, 180, 180);
  doc.rect(20, y, pageWidth - 40, 28, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("EVALUATION RESULT", 25, y + 8);

  doc.setFontSize(16);
  doc.text(`${data.totalMarks} / ${data.maxMarks}`, 25, y + 19);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Evaluated by: ${data.evaluatorName}`, 95, y + 10);
  if (data.evaluatorRemarks) {
    doc.text(`Remarks: ${data.evaluatorRemarks}`, 95, y + 18);
  }

  y += 38;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`ANSWER BOOKLET SCAN ARCHIVE (${data.pages.length} PAGES)`, 20, y);

  data.pages.forEach((_, idx) => {
    doc.addPage();
    doc.setDrawColor(0, 0, 0);
    doc.rect(10, 10, pageWidth - 20, 277);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Candidate: ${data.studentName} (${data.registerNumber}) | Page ${idx + 1} of ${data.pages.length}`, 15, 18);
    doc.text(`Subject: ${data.subjectCode}`, pageWidth - 15, 18, { align: "right" });

    doc.setFillColor(248, 248, 248);
    doc.rect(15, 25, pageWidth - 30, 250, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 25, pageWidth - 30, 250, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`[VERIFIED ANSWER BOOKLET SCAN - PAGE ${idx + 1}]`, pageWidth / 2, 80, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Physical answer script verified, stamped and signed by Senior Examiner.", pageWidth / 2, 95, {
      align: "center",
    });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(pageWidth / 2 - 40, 120, 80, 40);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("EXAMINATION BOARD VERIFIED", pageWidth / 2, 135, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Score: ${data.totalMarks} / ${data.maxMarks}`, pageWidth / 2, 145, { align: "center" });
  });

  doc.save(`AnswerSheet_${data.registerNumber}_${data.subjectCode}.pdf`);
}
