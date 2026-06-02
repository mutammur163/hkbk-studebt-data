"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, roles_1.anyAuthenticated);
router.get('/summary', dashboardController_1.getSummary);
router.get('/branch-stats', dashboardController_1.getBranchStats);
router.get('/category-stats', dashboardController_1.getCategoryStats);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map