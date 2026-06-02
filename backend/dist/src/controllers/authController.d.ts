import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const register: (req: AuthRequest, res: Response) => Promise<void>;
export declare const login: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map