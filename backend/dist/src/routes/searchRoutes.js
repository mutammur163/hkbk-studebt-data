"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, roles_1.anyAuthenticated, searchController_1.search);
exports.default = router;
//# sourceMappingURL=searchRoutes.js.map