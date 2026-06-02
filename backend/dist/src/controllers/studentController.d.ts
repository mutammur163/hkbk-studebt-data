import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const listStudents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteStudent: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=studentController.d.ts.map