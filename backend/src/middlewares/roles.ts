import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type Role = 'admin' | 'admission_staff' | 'faculty' | 'viewer';

const roleHierarchy: Record<Role, number> = {
  admin: 4,
  admission_staff: 3,
  faculty: 2,
  viewer: 1,
};

// Check if user has one of the allowed roles
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userRole = req.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`,
      });
      return;
    }

    next();
  };
};

// Shorthand permission checks
export const adminOnly = authorize('admin');
export const staffOrAbove = authorize('admin', 'admission_staff');
export const facultyOrAbove = authorize('admin', 'admission_staff', 'faculty');
export const anyAuthenticated = authorize('admin', 'admission_staff', 'faculty', 'viewer');
