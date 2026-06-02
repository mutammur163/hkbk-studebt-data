import type { jsPDF } from 'jspdf';
import type { ReportAnalyticsPayload } from '../api/groqInsights';

function drawBars(doc: jsPDF, y: number, title: string, rows: { label: string; pct: number }[]): number {
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, y);
  y += 6;
  doc.setFontSize(9);
  rows.forEach((row) => {
    doc.setTextColor(71, 85, 105);
    doc.text(row.label.substring(0, 22), 14, y);
    const maxW = 100;
    const w = Math.max(0, (row.pct / 100) * maxW);
    doc.setDrawColor(226, 232, 240);
    doc.rect(58, y - 3.5, maxW, 5);
    doc.setFillColor(37, 99, 235);
    doc.rect(58, y - 3.5, w, 5, 'F');
    doc.setTextColor(15, 23, 42);
    doc.text(`${row.pct.toFixed(1)}%`, 162, y);
    y += 10;
  });
  return y + 4;
}

/** Loads jspdf only when called — avoids eager optimize-deps failures on unrelated routes. */
export async function downloadReportPdf(
  summary: ReportAnalyticsPayload,
  sampleRows: { sl_no?: string | number; usn: string; name: string; branch: string; quota: string; category: string; gender: string }[],
  filename = 'admission_report.pdf'
): Promise<void> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableMod.default;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 16;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('HKBKCE — Admission Report', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 6;
  const f = summary.filters;
  doc.text(
    `Filters — Branch: ${f.branch || 'All'} | Quota: ${f.quota || 'All'} | Category: ${f.category || 'All'} | Gender: ${f.gender || 'All'}`,
    14,
    y
  );
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total students (matched): ${summary.total}`, 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.text('Gender distribution', 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Male: ${summary.gender.male} (${summary.gender.malePct.toFixed(1)}%)`, 14, y);
  y += 5;
  doc.text(`Female: ${summary.gender.female} (${summary.gender.femalePct.toFixed(1)}%)`, 14, y);
  y += 5;
  doc.text(`Other / unspecified: ${summary.gender.other}`, 14, y);
  y += 10;

  const pct = (c: number) => (summary.total ? (c / summary.total) * 100 : 0);

  y = drawBars(
    doc,
    y,
    'Branches (share of report set)',
    summary.topBranches.map((b) => ({ label: b.name, pct: pct(b.count) }))
  );

  y = drawBars(
    doc,
    y,
    'Categories (share of report set)',
    summary.topCategories.map((b) => ({ label: b.name, pct: pct(b.count) }))
  );

  y = drawBars(
    doc,
    y,
    'Quotas (share of report set)',
    summary.topQuotas.map((b) => ({ label: b.name, pct: pct(b.count) }))
  );

  if (y > 240) {
    doc.addPage();
    y = 16;
  }

  autoTable(doc, {
    startY: y,
    head: [['Sl No', 'USN', 'Name', 'Branch', 'Quota', 'Category', 'Gender']],
    body: sampleRows.slice(0, 40).map((r) => [
      String(r.sl_no ?? '—'),
      r.usn,
      r.name,
      r.branch,
      r.quota,
      r.category,
      r.gender || '—',
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(filename);
}
