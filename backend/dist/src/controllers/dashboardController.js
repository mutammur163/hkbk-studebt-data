"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.getBranchStats = exports.getSummary = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// GET /dashboard/summary
const getSummary = async (_req, res) => {
    const [total, genderStats, admissionStats] = await Promise.all([
        client_1.default.student.count(),
        client_1.default.student.groupBy({ by: ['gender'], _count: true }),
        client_1.default.admission.groupBy({ by: ['admissionType'], _count: true }),
    ]);
    const admissionCounts = {};
    admissionStats.forEach((a) => { admissionCounts[a.admissiontype || a.admissionType] = a._count; });
    const genderCounts = {};
    genderStats.forEach((g) => {
        const gender = g.gender ?? 'Unknown';
        genderCounts[gender] = g._count;
    });
    res.json({
        success: true,
        data: {
            totalStudents: total,
            admissionTypes: admissionCounts,
            genderDistribution: genderCounts,
        },
    });
};
exports.getSummary = getSummary;
// GET /dashboard/branch-stats
const getBranchStats = async (_req, res) => {
    const branchCounts = await client_1.default.student.groupBy({
        by: ['department'],
        _count: true,
    });
    const branches = await Promise.all(branchCounts.map(async (b) => {
        const rankStats = await client_1.default.admission.aggregate({
            where: { student: { department: b.department } },
            _min: { rank: true },
            _max: { rank: true },
            _avg: { rank: true },
        });
        return {
            department: b.department,
            count: b._count,
            bestRank: rankStats._min.rank,
            lastRank: rankStats._max.rank,
            avgRank: rankStats._avg.rank ? Math.round(rankStats._avg.rank) : null,
        };
    }));
    res.json({ success: true, data: branches });
};
exports.getBranchStats = getBranchStats;
// GET /dashboard/category-stats
const getCategoryStats = async (_req, res) => {
    const catStats = await client_1.default.admission.groupBy({
        by: ['allottedCategory'],
        _count: true,
        where: { allottedCategory: { not: null } },
    });
    const categories = await Promise.all(catStats.map(async (c) => {
        const rankStats = await client_1.default.admission.aggregate({
            where: { allottedCategory: c.allottedCategory },
            _min: { rank: true },
            _max: { rank: true },
        });
        return {
            category: c.allottedCategory,
            count: c._count,
            bestRank: rankStats._min.rank,
            lastRank: rankStats._max.rank,
        };
    }));
    res.json({ success: true, data: categories });
};
exports.getCategoryStats = getCategoryStats;
//# sourceMappingURL=dashboardController.js.map