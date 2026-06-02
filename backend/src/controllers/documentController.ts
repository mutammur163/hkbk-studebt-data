import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { paginationParams, buildPaginatedResponse } from '../utils/helpers';
// Prisma types removed — using DB shim

// POST /documents/upload
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const { title, type, department, academicYear } = req.body;

  const uploadedBy = req.user?.id ?? null;

  const doc = await prisma.document.create({
    data: {
      title,
      type,
      department: department || null,
      academicYear,
      fileUrl: req.file.path.replace(/\\/g, '/'),
      uploadedBy,
    },
  });

  res.status(201).json({ success: true, data: doc });
};

// GET /documents
export const listDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { skip, take, page } = paginationParams(req.query);
  const { type, year, department } = req.query;

  const where: any = {};
  if (type && typeof type === 'string') where.type = type as any;
  if (year && typeof year === 'string') where.academicYear = year;
  if (department && typeof department === 'string') where.department = department;

  const [docs, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { uploader: { select: { name: true } } },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.count({ where }),
  ]);

  res.json(buildPaginatedResponse(docs, total, page, take));
};

// GET /documents/:id
export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const doc = await prisma.document.findUnique({ where: { id } });

  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }

  const filePath = path.resolve(doc.fileUrl);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'File not found on disk' });
    return;
  }

  res.download(filePath, doc.title + path.extname(doc.fileUrl));
};
