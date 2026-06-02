"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudent = exports.listStudents = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const helpers_1 = require("../utils/helpers");
// using raw DB client shim; Prisma types removed
// GET /students — list with filters & pagination
const listStudents = async (req, res) => {
    const { skip, take, page } = (0, helpers_1.paginationParams)(req.query);
    const { department, admissionType, category, gender, rankMin, rankMax } = req.query;
    const where = {};
    if (department && typeof department === 'string')
        where.department = department;
    if (gender && typeof gender === 'string')
        where.gender = gender;
    const admissionWhere = {};
    if (admissionType && typeof admissionType === 'string')
        admissionWhere.admissionType = admissionType;
    if (category && typeof category === 'string') {
        const normalized = (0, helpers_1.normalizeCategory)(category);
        admissionWhere.OR = [
            { claimedCategory: normalized || undefined },
            { allottedCategory: normalized || undefined },
        ];
    }
    if (rankMin || rankMax) {
        admissionWhere.rank = {};
        if (rankMin && typeof rankMin === 'string')
            admissionWhere.rank.gte = parseInt(rankMin);
        if (rankMax && typeof rankMax === 'string')
            admissionWhere.rank.lte = parseInt(rankMax);
    }
    if (Object.keys(admissionWhere).length > 0) {
        where.admission = admissionWhere;
    }
    const [students, total] = await Promise.all([
        client_1.default.student.findMany({
            where,
            include: { admission: true },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        client_1.default.student.count({ where }),
    ]);
    res.json((0, helpers_1.buildPaginatedResponse)(students, total, page, take));
};
exports.listStudents = listStudents;
// GET /students/:id
const getStudent = async (req, res) => {
    const id = req.params.id;
    const student = await client_1.default.student.findUnique({
        where: { id },
        include: {
            admission: true,
            auditLogs: {
                orderBy: { timestamp: 'desc' },
                take: 20,
                include: { user: { select: { name: true, email: true } } },
            },
        },
    });
    if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
    }
    res.json({ success: true, data: student });
};
exports.getStudent = getStudent;
// POST /students
const createStudent = async (req, res) => {
    const { admission, ...studentData } = req.body;
    // Normalize categories
    if (admission?.claimedCategory) {
        admission.claimedCategory = (0, helpers_1.normalizeCategory)(admission.claimedCategory);
    }
    if (admission?.allottedCategory) {
        admission.allottedCategory = (0, helpers_1.normalizeCategory)(admission.allottedCategory);
    }
    const student = await client_1.default.student.create({
        data: {
            ...studentData,
            admission: admission ? { create: admission } : undefined,
        },
        include: { admission: true },
    });
    const userId = req.user?.id ?? null;
    // Audit log
    await client_1.default.auditLog.create({
        data: {
            userId,
            studentId: student.id,
            action: 'create',
            fieldName: 'record',
            newValue: `Created student: ${student.name} (${student.usn})`,
        },
    });
    res.status(201).json({ success: true, data: student });
};
exports.createStudent = createStudent;
// PUT /students/:id
const updateStudent = async (req, res) => {
    const id = req.params.id;
    const { admission, ...studentData } = req.body;
    // Get old record for audit comparison
    const old = await client_1.default.student.findUnique({
        where: { id },
        include: { admission: true },
    });
    if (!old) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
    }
    // Normalize categories
    if (admission?.claimedCategory) {
        admission.claimedCategory = (0, helpers_1.normalizeCategory)(admission.claimedCategory);
    }
    if (admission?.allottedCategory) {
        admission.allottedCategory = (0, helpers_1.normalizeCategory)(admission.allottedCategory);
    }
    // Compare and log changes for student fields
    const auditEntries = [];
    for (const [key, newVal] of Object.entries(studentData)) {
        const oldVal = old[key];
        if (oldVal !== undefined && String(oldVal) !== String(newVal)) {
            auditEntries.push({ fieldName: key, oldValue: String(oldVal), newValue: String(newVal) });
        }
    }
    // Compare admission fields
    if (admission && old.admission) {
        for (const [key, newVal] of Object.entries(admission)) {
            const oldVal = old.admission[key];
            if (oldVal !== undefined && String(oldVal) !== String(newVal)) {
                auditEntries.push({ fieldName: `admission.${key}`, oldValue: String(oldVal), newValue: String(newVal) });
            }
        }
    }
    // Update student
    const updated = await client_1.default.student.update({
        where: { id },
        data: {
            ...studentData,
            admission: admission ? { update: admission } : undefined,
        },
        include: { admission: true },
    });
    const userId = req.user?.id ?? null;
    // Save audit logs
    if (auditEntries.length > 0) {
        await client_1.default.auditLog.createMany({
            data: auditEntries.map(entry => ({
                userId,
                studentId: id,
                action: 'update',
                ...entry,
            })),
        });
    }
    res.json({ success: true, data: updated, changes: auditEntries.length });
};
exports.updateStudent = updateStudent;
// DELETE /students/:id
const deleteStudent = async (req, res) => {
    const id = req.params.id;
    const student = await client_1.default.student.findUnique({ where: { id } });
    if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
    }
    const userId = req.user?.id ?? null;
    // Audit log before deletion
    await client_1.default.auditLog.create({
        data: {
            userId,
            studentId: id,
            action: 'delete',
            fieldName: 'record',
            oldValue: `Deleted student: ${student.name} (${student.usn})`,
        },
    });
    await client_1.default.student.delete({ where: { id } });
    res.json({ success: true, message: 'Student deleted successfully' });
};
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=studentController.js.map