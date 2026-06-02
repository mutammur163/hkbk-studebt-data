import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'admission_staff', 'faculty', 'viewer']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Student ─────────────────────────────────────────
export const createStudentSchema = z.object({
  usn: z.string().min(3, 'USN is required'),
  name: z.string().min(2, 'Name is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  department: z.string().min(1, 'Department is required'),
  year: z.number().int().min(1).max(4).optional().default(1),
  section: z.string().optional(),
  mobile: z.string().min(10, 'Valid mobile number required'),
  email: z.string().email('Invalid email'),
  admission: z.object({
    admissionType: z.enum(['KCET', 'Management', 'KRLMPCA', 'Diploma']),
    cetNo: z.string().optional(),
    rank: z.number().int().positive('Rank must be a positive number').optional(),
    claimedCategory: z.string().optional(),
    allottedCategory: z.string().optional(),
    seatType: z.string().optional(),
    admissionRound: z.string().optional(),
    confirmationDate: z.string().datetime().optional().or(z.string().optional()),
  }).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// ─── Document ────────────────────────────────────────
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['seat_allotment', 'fee_structure', 'cutoff']),
  department: z.string().optional(),
  academicYear: z.string().min(4, 'Academic year is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
