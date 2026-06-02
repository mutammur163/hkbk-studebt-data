import { Router } from 'express';
import { generateReport } from '../controllers/reportController';
import { authenticate } from '../middlewares/auth';
import { facultyOrAbove } from '../middlewares/roles';

const router = Router();

router.get('/generate', authenticate, facultyOrAbove, generateReport);

export default router;
