import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { normalizeCategory } from '../utils/helpers';
// Prisma types removed — using DB shim
type StudentWithAdmission = any;

// GET /reports/generate?format=json|pdf|csv
export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { branch, category, admissionType, rankMin, rankMax, format = 'json' } = req.query;

  const where: any = {};
  if (branch) where.department = branch as string;

  const admissionWhere: any = {};
  if (admissionType) admissionWhere.admissionType = admissionType as any;
  if (category) {
    const normalized = normalizeCategory(category as string);
    if (normalized) admissionWhere.allottedCategory = normalized;
  }
  if (rankMin || rankMax) {
    admissionWhere.rank = {};
    if (rankMin) admissionWhere.rank.gte = parseInt(rankMin as string);
    if (rankMax) admissionWhere.rank.lte = parseInt(rankMax as string);
  }

  if (Object.keys(admissionWhere).length > 0) {
    where.admission = admissionWhere;
  }

  const students = await prisma.student.findMany({
    where,
    include: { admission: true },
    orderBy: { name: 'asc' },
  });

  // ─── CSV Export ────────────────────────────────────
  if (format === 'csv') {
    const rows = (students as StudentWithAdmission[]).map((s: StudentWithAdmission) => ({
      USN: s.usn,
      Name: s.name,
      Gender: s.gender,
      Department: s.department,
      Year: s.year,
      Section: s.section || '',
      Mobile: s.mobile,
      Email: s.email,
      AdmissionType: s.admission?.admissionType || '',
      CETNo: s.admission?.cetNo || '',
      Rank: s.admission?.rank || '',
      ClaimedCategory: s.admission?.claimedCategory || '',
      AllottedCategory: s.admission?.allottedCategory || '',
      SeatType: s.admission?.seatType || '',
      AdmissionRound: s.admission?.admissionRound || '',
    }));

    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
    res.send(csv);
    return;
  }

  // ─── PDF Export ────────────────────────────────────
  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=students_report.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('HKBKCE - Student Admission Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text(`Generated on: ${new Date().toLocaleDateString()} | Total Records: ${students.length}`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const headers = ['USN', 'Name', 'Dept', 'Type', 'Rank', 'Category'];
    const colWidths = [100, 150, 60, 80, 60, 80];
    let x = 40;
    const y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333');
    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i] });
      x += colWidths[i] + 10;
    });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(760, doc.y).stroke('#ccc');
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(8).fillColor('#444');
    (students as StudentWithAdmission[]).forEach((s: StudentWithAdmission) => {
      if (doc.y > 520) {
        doc.addPage();
        doc.y = 40;
      }
      x = 40;
      const row = [
        s.usn,
        s.name,
        s.department,
        s.admission?.admissionType || '-',
        s.admission?.rank?.toString() || '-',
        s.admission?.allottedCategory || '-',
      ];
      const rowY = doc.y;
      row.forEach((cell, i) => {
        doc.text(cell, x, rowY, { width: colWidths[i] });
        x += colWidths[i] + 10;
      });
      doc.moveDown(0.6);
    });

    doc.end();
    return;
  }

  // ─── JSON (default) ───────────────────────────────
  res.json({
    success: true,
    data: students,
    meta: {
      total: students.length,
      filters: { branch, category, admissionType, rankMin, rankMax },
      generatedAt: new Date().toISOString(),
    },
  });
};
