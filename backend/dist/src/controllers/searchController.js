"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// GET /search?q=
const search = async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
        res.json({ success: true, data: [] });
        return;
    }
    const students = await client_1.default.student.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { usn: { contains: q, mode: 'insensitive' } },
                { admission: { cetNo: { contains: q, mode: 'insensitive' } } },
            ],
        },
        include: {
            admission: { select: { admissionType: true, cetNo: true, rank: true, allottedCategory: true } },
        },
        take: 10,
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: students, count: students.length });
};
exports.search = search;
//# sourceMappingURL=searchController.js.map