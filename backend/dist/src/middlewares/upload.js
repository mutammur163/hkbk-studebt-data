"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./errorHandler");
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError(`Invalid file type: ${file.mimetype}. Only PDF, CSV, and Excel files are allowed.`, 400));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});
//# sourceMappingURL=upload.js.map