"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocumentSchema = exports.updateStudentSchema = exports.createStudentSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ─── Auth ────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['admin', 'admission_staff', 'faculty', 'viewer']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// ─── Student ─────────────────────────────────────────
exports.createStudentSchema = zod_1.z.object({
    usn: zod_1.z.string().min(3, 'USN is required'),
    name: zod_1.z.string().min(2, 'Name is required'),
    gender: zod_1.z.enum(['Male', 'Female', 'Other']),
    department: zod_1.z.string().min(1, 'Department is required'),
    year: zod_1.z.number().int().min(1).max(4).optional().default(1),
    section: zod_1.z.string().optional(),
    mobile: zod_1.z.string().min(10, 'Valid mobile number required'),
    email: zod_1.z.string().email('Invalid email'),
    admission: zod_1.z.object({
        admissionType: zod_1.z.enum(['KCET', 'Management', 'KRLMPCA', 'Diploma']),
        cetNo: zod_1.z.string().optional(),
        rank: zod_1.z.number().int().positive('Rank must be a positive number').optional(),
        claimedCategory: zod_1.z.string().optional(),
        allottedCategory: zod_1.z.string().optional(),
        seatType: zod_1.z.string().optional(),
        admissionRound: zod_1.z.string().optional(),
        confirmationDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().optional()),
    }).optional(),
});
exports.updateStudentSchema = exports.createStudentSchema.partial();
// ─── Document ────────────────────────────────────────
exports.createDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    type: zod_1.z.enum(['seat_allotment', 'fee_structure', 'cutoff']),
    department: zod_1.z.string().optional(),
    academicYear: zod_1.z.string().min(4, 'Academic year is required'),
});
//# sourceMappingURL=validators.js.map