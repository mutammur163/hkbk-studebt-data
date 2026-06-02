"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCutoff = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// GET /cutoff?department=CSE
const getCutoff = async (req, res) => {
    const department = req.query.department;
    if (!department) {
        res.status(400).json({ success: false, message: 'Department query parameter is required' });
        return;
    }
    const catStats = await client_1.default.admission.groupBy({
        by: ['allottedCategory'],
        where: {
            student: { department },
            allottedCategory: { not: null },
            rank: { not: null },
        },
        _min: { rank: true },
        _max: { rank: true },
        _count: true,
    });
    const cutoff = catStats.map((c) => ({
        category: c.allottedCategory,
        bestRank: c._min.rank,
        lastRank: c._max.rank,
        count: c._count,
    }));
    cutoff.sort((a, b) => (a.bestRank || 0) - (b.bestRank || 0));
    res.json({ success: true, data: { department, cutoff } });
};
exports.getCutoff = getCutoff;
//# sourceMappingURL=cutoffController.js.map