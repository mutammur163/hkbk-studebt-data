import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { RegisterInput, LoginInput } from '../utils/validators';

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId }, secret, {
    expiresIn: 604800, // 7 days in seconds
  });
}

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || 'viewer' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  res.status(201).json({ success: true, data: { user, token } });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = signToken(user.id);
  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ success: true, data: req.user });
};
