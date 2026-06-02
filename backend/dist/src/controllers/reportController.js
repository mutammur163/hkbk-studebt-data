"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const sync_1 = require("csv-stringify/sync");
const client_1 = __importDefault(require("../prisma/client"));
const helpers_1 = require("../utils/helpers");
// GET /reports/generate?format=json|pdf|csv
const generateReport = async (req, res) => {
    const { branch, category, admissionType, rankMin, rankMax, format = 'json' } = req.query;
    const where = {};
    if (branch)
        where.department = branch;
    const admissionWhere = {};
    if (admissionType)
        admissionWhere.admissionType = admissionType;
    if (category) {
        const normalized = (0, helpers_1.normalizeCategory)(category);
        if (normalized)
            admissionWhere.allottedCategory = normalized;
    }
    if (rankMin || rankMax) {
        admissionWhere.rank = {};
        if (rankMin)
            admissionWhere.rank.gte = parseInt(rankMin);
        if (rankMax)
            admissionWhere.rank.lte = parseInt(rankMax);
    }
    if (Object.keys(admissionWhere).length > 0) {
        where.admission = admissionWhere;
    }
    const students = await client_1.default.student.findMany({
        where,
        include: { admission: true },
        orderBy: { name: 'asc' },
    });
    // ─── CSV Export ────────────────────────────────────
    if (format === 'csv') {
        const rows = students.map((s) => ({
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
        const csv = (0, sync_1.stringify)(rows, { header: true });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students_report.csv');
        res.send(csv);
        return;
    }
    // ─── PDF Export ────────────────────────────────────
    if (format === 'pdf') {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4', layout: 'landscape' });
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
        students.forEach((s) => {
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
exports.generateReport = generateReport;
//# sourceMappingURL=reportController.js.map