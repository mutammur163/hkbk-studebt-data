"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpload = void 0;
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
const client_1 = __importDefault(require("../prisma/client"));
const helpers_1 = require("../utils/helpers");
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
function normalizeAdmissionType(raw) {
    if (!raw)
        return null;
    const upper = raw.toString().toUpperCase().trim();
    const map = {
        'MGT': 'Management',
        'MGMT': 'Management',
        'MANAGEMENT': 'Management',
        'CET': 'KCET',
        'KCET': 'KCET',
        'KRLMPCA': 'KRLMPCA',
        'DIPLOMA': 'Diploma',
        'SNQ': 'KCET', // SNQ seats are awarded via KCET; keep as KCET if no better enum exists
    };
    return map[upper] ?? raw.trim();
}
// POST /students/bulk-upload
const bulkUpload = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded. Please upload a CSV file.' });
        return;
    }
    const content = fs_1.default.readFileSync(req.file.path, 'utf-8');
    let records;
    try {
        records = (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
    }
    catch {
        res.status(400).json({ success: false, message: 'Invalid CSV format. Please check the file.' });
        return;
    }
    const results = { created: 0, skipped: 0, errors: [] };
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
            await client_1.default.student.create({
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
                            admissionType: normalizeAdmissionType(rawAdmissionType),
                            cetNo: rawCetNo?.trim() || null,
                            rank: row.rank ? parseInt(row.rank) : null,
                            claimedCategory: (0, helpers_1.normalizeCategory)(row.claimedCategory),
                            allottedCategory: (0, helpers_1.normalizeCategory)(row.allottedCategory),
                            seatType: row.seatType?.trim() || null,
                            admissionRound: row.admissionRound?.trim() || null,
                            confirmationDate: row.confirmationDate ? new Date(row.confirmationDate) : null,
                        },
                    } : undefined,
                },
            });
            results.created++;
        }
        catch (err) {
            if (err.code === 'P2002') {
                results.errors.push(`Row ${rowNum}: Duplicate USN "${row.usn}"`);
            }
            else {
                results.errors.push(`Row ${rowNum}: ${err.message}`);
            }
            results.skipped++;
        }
    }
    const userId = req.user?.id ?? null;
    // Audit log
    await client_1.default.auditLog.create({
        data: {
            userId,
            action: 'create',
            fieldName: 'bulk_upload',
            newValue: `Bulk upload: ${results.created} created, ${results.skipped} skipped from ${records.length} rows`,
        },
    });
    // Clean up temp file
    fs_1.default.unlinkSync(req.file.path);
    res.json({
        success: true,
        message: `Bulk upload complete: ${results.created} created, ${results.skipped} skipped`,
        data: results,
    });
};
exports.bulkUpload = bulkUpload;
//# sourceMappingURL=bulkController.js.map