import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';

// GET /dashboard/summary
export const getSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [total, genderStats, admissionStats] = await Promise.all([
    prisma.student.count(),
    prisma.student.groupBy({ by: ['gender'], _count: true }),
    prisma.admission.groupBy({ by: ['admissionType'], _count: true }),
  ]);

  const admissionCounts: Record<string, number> = {};
  (admissionStats as any[]).forEach((a: any) => { admissionCounts[a.admissiontype || a.admissionType] = a._count; });

  const genderCounts: Record<string, number> = {};
  (genderStats as any[]).forEach((g: any) => {
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

// GET /dashboard/branch-stats
export const getBranchStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const branchCounts = await prisma.student.groupBy({
    by: ['department'],
    _count: true,
  });

  const branches = await Promise.all(
    branchCounts.map(async (b: typeof branchCounts[number]) => {
      const rankStats = await prisma.admission.aggregate({
        where: { student: { department: (b as any).department } },
        _min: { rank: true },
        _max: { rank: true },
        _avg: { rank: true },
      });
      return {
        department: (b as any).department,
        count: b._count,
        bestRank: rankStats._min.rank,
        lastRank: rankStats._max.rank,
        avgRank: rankStats._avg.rank ? Math.round(rankStats._avg.rank) : null,
      };
    })
  );

  res.json({ success: true, data: branches });
};

// GET /dashboard/category-stats
export const getCategoryStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const catStats = await prisma.admission.groupBy({
    by: ['allottedCategory'],
    _count: true,
    where: { allottedCategory: { not: null } },
  });

  const categories = await Promise.all(
    catStats.map(async (c: typeof catStats[number]) => {
      const rankStats = await prisma.admission.aggregate({
        where: { allottedCategory: (c as any).allottedCategory },
        _min: { rank: true },
        _max: { rank: true },
      });
      return {
        category: (c as any).allottedCategory,
        count: c._count,
        bestRank: rankStats._min.rank,
        lastRank: rankStats._max.rank,
      };
    })
  );

  res.json({ success: true, data: categories });
};
