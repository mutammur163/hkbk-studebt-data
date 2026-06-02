import { Router } from 'express';
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/studentController';
import { bulkUpload } from '../controllers/bulkController';
import { authenticate } from '../middlewares/auth';
import { staffOrAbove, facultyOrAbove, adminOnly } from '../middlewares/roles';
import { validate } from '../middlewares/validate';
import { createStudentSchema, updateStudentSchema } from '../utils/validators';
import { upload } from '../middlewares/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', facultyOrAbove, listStudents);
router.get('/:id', facultyOrAbove, getStudent);
router.post('/', staffOrAbove, validate(createStudentSchema), createStudent);
router.put('/:id', staffOrAbove, validate(updateStudentSchema), updateStudent);
router.delete('/:id', adminOnly, deleteStudent);

// Bulk upload
router.post('/bulk-upload', staffOrAbove, upload.single('file'), bulkUpload);

export default router;
