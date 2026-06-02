import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
type Role = 'admin' | 'admission_staff' | 'faculty' | 'viewer';
export declare const authorize: (...allowedRoles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const staffOrAbove: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const facultyOrAbove: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const anyAuthenticated: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=roles.d.ts.map