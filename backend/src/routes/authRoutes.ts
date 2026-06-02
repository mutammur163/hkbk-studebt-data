import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticate, getProfile);

export default router;
