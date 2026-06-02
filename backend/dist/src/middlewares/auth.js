"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'default-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, name: true },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map