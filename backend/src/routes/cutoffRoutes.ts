import { Router } from 'express';
import { getCutoff } from '../controllers/cutoffController';
import { authenticate } from '../middlewares/auth';
import { anyAuthenticated } from '../middlewares/roles';

const router = Router();

router.get('/', authenticate, anyAuthenticated, getCutoff);

export default router;
