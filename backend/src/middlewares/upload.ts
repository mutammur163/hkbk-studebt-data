import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type: ${file.mimetype}. Only PDF, CSV, and Excel files are allowed.`, 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});
