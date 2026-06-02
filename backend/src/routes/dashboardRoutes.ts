import { Router } from 'express';
import { getSummary, getBranchStats, getCategoryStats } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';
import { anyAuthenticated } from '../middlewares/roles';

const router = Router();

router.use(authenticate, anyAuthenticated);

router.get('/summary', getSummary);
router.get('/branch-stats', getBranchStats);
router.get('/category-stats', getCategoryStats);

export default router;
