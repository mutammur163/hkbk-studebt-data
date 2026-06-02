import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["admin", "admission_staff", "faculty", "viewer"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "admission_staff" | "faculty" | "viewer" | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "admission_staff" | "faculty" | "viewer" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createStudentSchema: z.ZodObject<{
    usn: z.ZodString;
    name: z.ZodString;
    gender: z.ZodEnum<["Male", "Female", "Other"]>;
    department: z.ZodString;
    year: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    section: z.ZodOptional<z.ZodString>;
    mobile: z.ZodString;
    email: z.ZodString;
    admission: z.ZodOptional<z.ZodObject<{
        admissionType: z.ZodEnum<["KCET", "Management", "KRLMPCA", "Diploma"]>;
        cetNo: z.ZodOptional<z.ZodString>;
        rank: z.ZodOptional<z.ZodNumber>;
        claimedCategory: z.ZodOptional<z.ZodString>;
        allottedCategory: z.ZodOptional<z.ZodString>;
        seatType: z.ZodOptional<z.ZodString>;
        admissionRound: z.ZodOptional<z.ZodString>;
        confirmationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    }, "strip", z.ZodTypeAny, {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    }, {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    usn: string;
    gender: "Male" | "Female" | "Other";
    department: string;
    year: number;
    mobile: string;
    admission?: {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    } | undefined;
    section?: string | undefined;
}, {
    name: string;
    email: string;
    usn: string;
    gender: "Male" | "Female" | "Other";
    department: string;
    mobile: string;
    admission?: {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    } | undefined;
    year?: number | undefined;
    section?: string | undefined;
}>;
export declare const updateStudentSchema: z.ZodObject<{
    usn: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["Male", "Female", "Other"]>>;
    department: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    section: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    mobile: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    admission: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        admissionType: z.ZodEnum<["KCET", "Management", "KRLMPCA", "Diploma"]>;
        cetNo: z.ZodOptional<z.ZodString>;
        rank: z.ZodOptional<z.ZodNumber>;
        claimedCategory: z.ZodOptional<z.ZodString>;
        allottedCategory: z.ZodOptional<z.ZodString>;
        seatType: z.ZodOptional<z.ZodString>;
        admissionRound: z.ZodOptional<z.ZodString>;
        confirmationDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodString>]>;
    }, "strip", z.ZodTypeAny, {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    }, {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    admission?: {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    } | undefined;
    name?: string | undefined;
    email?: string | undefined;
    usn?: string | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
    department?: string | undefined;
    year?: number | undefined;
    section?: string | undefined;
    mobile?: string | undefined;
}, {
    admission?: {
        admissionType: "KCET" | "Management" | "KRLMPCA" | "Diploma";
        cetNo?: string | undefined;
        rank?: number | undefined;
        claimedCategory?: string | undefined;
        allottedCategory?: string | undefined;
        seatType?: string | undefined;
        admissionRound?: string | undefined;
        confirmationDate?: string | undefined;
    } | undefined;
    name?: string | undefined;
    email?: string | undefined;
    usn?: string | undefined;
    gender?: "Male" | "Female" | "Other" | undefined;
    department?: string | undefined;
    year?: number | undefined;
    section?: string | undefined;
    mobile?: string | undefined;
}>;
export declare const createDocumentSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodEnum<["seat_allotment", "fee_structure", "cutoff"]>;
    department: z.ZodOptional<z.ZodString>;
    academicYear: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "seat_allotment" | "fee_structure" | "cutoff";
    title: string;
    academicYear: string;
    department?: string | undefined;
}, {
    type: "seat_allotment" | "fee_structure" | "cutoff";
    title: string;
    academicYear: string;
    department?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
//# sourceMappingURL=validators.d.ts.map