"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const router = (0, express_1.Router)();
router.get('/generate', auth_1.authenticate, roles_1.facultyOrAbove, reportController_1.generateReport);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map