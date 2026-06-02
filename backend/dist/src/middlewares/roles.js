"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyAuthenticated = exports.facultyOrAbove = exports.staffOrAbove = exports.adminOnly = exports.authorize = void 0;
const roleHierarchy = {
    admin: 4,
    admission_staff: 3,
    faculty: 2,
    viewer: 1,
};
// Check if user has one of the allowed roles
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const userRole = req.user.role;
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
exports.authorize = authorize;
// Shorthand permission checks
exports.adminOnly = (0, exports.authorize)('admin');
exports.staffOrAbove = (0, exports.authorize)('admin', 'admission_staff');
exports.facultyOrAbove = (0, exports.authorize)('admin', 'admission_staff', 'faculty');
exports.anyAuthenticated = (0, exports.authorize)('admin', 'admission_staff', 'faculty', 'viewer');
//# sourceMappingURL=roles.js.map