import { Response } from 'express';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { normalizeCategory } from '../utils/helpers';

/**
 * Maps CSV quota aliases to the Prisma AdmissionType enum values.
 *
 * CSV alias     →  Prisma enum
 * -----------      -----------
 * MGT              Management
 * MGMT             Management
 * MANAGEMENT       Management
 * CET              KCET
 * KCET             KCET       (passthrough)
 * KRLMPCA          KRLMPCA    (passthrough)
 * DIPLOMA          Diploma
 */
function normalizeAdmissionType(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.toString().toUpperCase().trim();
  const map: Record<string, string> = {
    'MGT':        'Management',
    'MGMT':       'Management',
    'MANAGEMENT': 'Management',
    'CET':        'KCET',
    'KCET':       'KCET',
    'KRLMPCA':    'KRLMPCA',
    'DIPLOMA':    'Diploma',
    'SNQ':        'KCET', // SNQ seats are awarded via KCET; keep as KCET if no better enum exists
  };
  return map[upper] ?? raw.trim();
}

// POST /students/bulk-upload
export const bulkUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded. Please upload a CSV file.' });
    return;
  }

  const content = fs.readFileSync(req.file.path, 'utf-8');
  let records: any[];

  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    res.status(400).json({ success: false, message: 'Invalid CSV format. Please check the file.' });
    return;
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNum = i + 2; // +2 for header row and 0-index

    // Validate required fields
    if (!row.usn || !row.name || !row.department || !row.gender || !row.mobile || !row.email) {
      results.errors.push(`Row ${rowNum}: Missing required fields (usn, name, department, gender, mobile, email)`);
      results.skipped++;
      continue;
    }

    // Validate rank is numeric
    if (row.rank && isNaN(parseInt(row.rank))) {
      results.errors.push(`Row ${rowNum}: Rank must be numeric (got: ${row.rank})`);
      results.skipped++;
      continue;
    }

    // Accept 'quota' as CSV alias for 'admissionType' (Supabase exports use 'quota')
    // Accept 'cet_no' / 'cetno' as alias for 'cetNo'
    const rawAdmissionType = row.admissionType ?? row.quota ?? null;
    const rawCetNo = row.cetNo ?? row.cet_no ?? row.cetno ?? null;

    try {
      await prisma.student.create({
        data: {
          usn: row.usn.trim(),
          name: row.name.trim(),
          gender: row.gender.trim(),
          department: row.department.trim(),
          year: parseInt(row.year) || 1,
          section: row.section?.trim() || null,
          mobile: row.mobile.trim(),
          email: row.email.trim(),
          admission: rawAdmissionType ? {
            create: {
              admissionType: normalizeAdmissionType(rawAdmissionType) as any,
              cetNo: rawCetNo?.trim() || null,
              rank: row.rank ? parseInt(row.rank) : null,
              claimedCategory: normalizeCategory(row.claimedCategory),
              allottedCategory: normalizeCategory(row.allottedCategory),
              seatType: row.seatType?.trim() || null,
              admissionRound: row.admissionRound?.trim() || null,
              confirmationDate: row.confirmationDate ? new Date(row.confirmationDate) : null,
            },
          } : undefined,
        },
      });
      results.created++;
    } catch (err: any) {
      if (err.code === 'P2002') {
        results.errors.push(`Row ${rowNum}: Duplicate USN "${row.usn}"`);
      } else {
        results.errors.push(`Row ${rowNum}: ${err.message}`);
      }
      results.skipped++;
    }
  }

  const userId = req.user?.id ?? null;

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'create',
      fieldName: 'bulk_upload',
      newValue: `Bulk upload: ${results.created} created, ${results.skipped} skipped from ${records.length} rows`,
    },
  });

  // Clean up temp file
  fs.unlinkSync(req.file.path);

  res.json({
    success: true,
    message: `Bulk upload complete: ${results.created} created, ${results.skipped} skipped`,
    data: results,
  });
};
