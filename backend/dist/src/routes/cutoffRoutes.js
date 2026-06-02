"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cutoffController_1 = require("../controllers/cutoffController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, roles_1.anyAuthenticated, cutoffController_1.getCutoff);
exports.default = router;
//# sourceMappingURL=cutoffRoutes.js.map