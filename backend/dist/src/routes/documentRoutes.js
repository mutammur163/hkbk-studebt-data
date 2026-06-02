"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/upload', roles_1.staffOrAbove, upload_1.upload.single('file'), documentController_1.uploadDocument);
router.get('/', roles_1.anyAuthenticated, documentController_1.listDocuments);
router.get('/:id', roles_1.anyAuthenticated, documentController_1.getDocument);
exports.default = router;
//# sourceMappingURL=documentRoutes.js.map