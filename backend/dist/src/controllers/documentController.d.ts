import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare const uploadDocument: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listDocuments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDocument: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=documentController.d.ts.map