import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';

// GET /search?q=
export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string || '').trim();

  if (!q || q.length < 2) {
    res.json({ success: true, data: [] });
    return;
  }

  const students = await prisma.student.findMany({
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
