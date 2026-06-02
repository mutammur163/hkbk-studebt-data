"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
function signToken(userId) {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: 604800, // 7 days in seconds
    });
}
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    const existing = await client_1.default.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await client_1.default.user.create({
        data: { name, email, passwordHash, role: role || 'viewer' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = signToken(user.id);
    res.status(201).json({ success: true, data: { user, token } });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await client_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
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
exports.login = login;
const getProfile = async (req, res) => {
    res.json({ success: true, data: req.user });
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map