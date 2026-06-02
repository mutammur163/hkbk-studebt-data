"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const bulkController_1 = require("../controllers/bulkController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../utils/validators");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', roles_1.facultyOrAbove, studentController_1.listStudents);
router.get('/:id', roles_1.facultyOrAbove, studentController_1.getStudent);
router.post('/', roles_1.staffOrAbove, (0, validate_1.validate)(validators_1.createStudentSchema), studentController_1.createStudent);
router.put('/:id', roles_1.staffOrAbove, (0, validate_1.validate)(validators_1.updateStudentSchema), studentController_1.updateStudent);
router.delete('/:id', roles_1.adminOnly, studentController_1.deleteStudent);
// Bulk upload
router.post('/bulk-upload', roles_1.staffOrAbove, upload_1.upload.single('file'), bulkController_1.bulkUpload);
exports.default = router;
//# sourceMappingURL=studentRoutes.js.map