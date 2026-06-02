import { Router } from 'express';
import { search } from '../controllers/searchController';
import { authenticate } from '../middlewares/auth';
import { anyAuthenticated } from '../middlewares/roles';

const router = Router();

router.get('/', authenticate, anyAuthenticated, search);

export default router;
