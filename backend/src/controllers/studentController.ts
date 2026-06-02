import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { normalizeCategory, paginationParams, buildPaginatedResponse } from '../utils/helpers';
// using raw DB client shim; Prisma types removed

// GET /students — list with filters & pagination
export const listStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { skip, take, page } = paginationParams(req.query);
  const { department, admissionType, category, gender, rankMin, rankMax } = req.query;

  const where: any = {};
  if (department && typeof department === 'string') where.department = department;
  if (gender && typeof gender === 'string') where.gender = gender;

  const admissionWhere: any = {};
  if (admissionType && typeof admissionType === 'string') admissionWhere.admissionType = admissionType as any;
  if (category && typeof category === 'string') {
    const normalized = normalizeCategory(category);
    admissionWhere.OR = [
      { claimedCategory: normalized || undefined },
      { allottedCategory: normalized || undefined },
    ];
  }
  if (rankMin || rankMax) {
    admissionWhere.rank = {};
    if (rankMin && typeof rankMin === 'string') admissionWhere.rank.gte = parseInt(rankMin);
    if (rankMax && typeof rankMax === 'string') admissionWhere.rank.lte = parseInt(rankMax);
  }

  if (Object.keys(admissionWhere).length > 0) {
    where.admission = admissionWhere;
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { admission: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  res.json(buildPaginatedResponse(students, total, page, take));
};

// GET /students/:id
export const getStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const student = await prisma.student.findUnique({
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

// POST /students
export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { admission, ...studentData } = req.body;

  // Normalize categories
  if (admission?.claimedCategory) {
    admission.claimedCategory = normalizeCategory(admission.claimedCategory);
  }
  if (admission?.allottedCategory) {
    admission.allottedCategory = normalizeCategory(admission.allottedCategory);
  }

  const student = await prisma.student.create({
    data: {
      ...studentData,
      admission: admission ? { create: admission } : undefined,
    },
    include: { admission: true },
  });

  const userId = req.user?.id ?? null;

  // Audit log
  await prisma.auditLog.create({
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

// PUT /students/:id
export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { admission, ...studentData } = req.body;

  // Get old record for audit comparison
  const old = await prisma.student.findUnique({
    where: { id },
    include: { admission: true },
  });

  if (!old) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  // Normalize categories
  if (admission?.claimedCategory) {
    admission.claimedCategory = normalizeCategory(admission.claimedCategory);
  }
  if (admission?.allottedCategory) {
    admission.allottedCategory = normalizeCategory(admission.allottedCategory);
  }

  // Compare and log changes for student fields
  const auditEntries: { fieldName: string; oldValue: string; newValue: string }[] = [];

  for (const [key, newVal] of Object.entries(studentData)) {
    const oldVal = (old as any)[key];
    if (oldVal !== undefined && String(oldVal) !== String(newVal)) {
      auditEntries.push({ fieldName: key, oldValue: String(oldVal), newValue: String(newVal) });
    }
  }

  // Compare admission fields
  if (admission && old.admission) {
    for (const [key, newVal] of Object.entries(admission)) {
      const oldVal = (old.admission as any)[key];
      if (oldVal !== undefined && String(oldVal) !== String(newVal)) {
        auditEntries.push({ fieldName: `admission.${key}`, oldValue: String(oldVal), newValue: String(newVal) });
      }
    }
  }

  // Update student
  const updated = await prisma.student.update({
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
    await prisma.auditLog.createMany({
      data: auditEntries.map(entry => ({
        userId,
        studentId: id,
        action: 'update' as const,
        ...entry,
      })),
    });
  }

  res.json({ success: true, data: updated, changes: auditEntries.length });
};

// DELETE /students/:id
export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }

  const userId = req.user?.id ?? null;

  // Audit log before deletion
  await prisma.auditLog.create({
    data: {
      userId,
      studentId: id,
      action: 'delete',
      fieldName: 'record',
      oldValue: `Deleted student: ${student.name} (${student.usn})`,
    },
  });

  await prisma.student.delete({ where: { id } });

  res.json({ success: true, message: 'Student deleted successfully' });
};
