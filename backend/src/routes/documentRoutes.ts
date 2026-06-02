import { Router } from 'express';
import { uploadDocument, listDocuments, getDocument } from '../controllers/documentController';
import { authenticate } from '../middlewares/auth';
import { staffOrAbove, anyAuthenticated } from '../middlewares/roles';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

router.post('/upload', staffOrAbove, upload.single('file'), uploadDocument);
router.get('/', anyAuthenticated, listDocuments);
router.get('/:id', anyAuthenticated, getDocument);

export default router;
