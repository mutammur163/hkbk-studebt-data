import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';

// GET /cutoff?department=CSE
export const getCutoff = async (req: AuthRequest, res: Response): Promise<void> => {
  const department = req.query.department as string;

  if (!department) {
    res.status(400).json({ success: false, message: 'Department query parameter is required' });
    return;
  }

  const catStats = await prisma.admission.groupBy({
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

  const cutoff = catStats.map((c: any) => ({
    category: c.allottedCategory,
    bestRank: c._min.rank,
    lastRank: c._max.rank,
    count: c._count,
  }));

  cutoff.sort((a: typeof cutoff[number], b: typeof cutoff[number]) => (a.bestRank || 0) - (b.bestRank || 0));

  res.json({ success: true, data: { department, cutoff } });
};
