"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocument = exports.listDocuments = exports.uploadDocument = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = __importDefault(require("../prisma/client"));
const helpers_1 = require("../utils/helpers");
// Prisma types removed — using DB shim
// POST /documents/upload
const uploadDocument = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const { title, type, department, academicYear } = req.body;
    const uploadedBy = req.user?.id ?? null;
    const doc = await client_1.default.document.create({
        data: {
            title,
            type,
            department: department || null,
            academicYear,
            fileUrl: req.file.path.replace(/\\/g, '/'),
            uploadedBy,
        },
    });
    res.status(201).json({ success: true, data: doc });
};
exports.uploadDocument = uploadDocument;
// GET /documents
const listDocuments = async (req, res) => {
    const { skip, take, page } = (0, helpers_1.paginationParams)(req.query);
    const { type, year, department } = req.query;
    const where = {};
    if (type && typeof type === 'string')
        where.type = type;
    if (year && typeof year === 'string')
        where.academicYear = year;
    if (department && typeof department === 'string')
        where.department = department;
    const [docs, total] = await Promise.all([
        client_1.default.document.findMany({
            where,
            include: { uploader: { select: { name: true } } },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        client_1.default.document.count({ where }),
    ]);
    res.json((0, helpers_1.buildPaginatedResponse)(docs, total, page, take));
};
exports.listDocuments = listDocuments;
// GET /documents/:id
const getDocument = async (req, res) => {
    const id = req.params.id;
    const doc = await client_1.default.document.findUnique({ where: { id } });
    if (!doc) {
        res.status(404).json({ success: false, message: 'Document not found' });
        return;
    }
    const filePath = path_1.default.resolve(doc.fileUrl);
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({ success: false, message: 'File not found on disk' });
        return;
    }
    res.download(filePath, doc.title + path_1.default.extname(doc.fileUrl));
};
exports.getDocument = getDocument;
//# sourceMappingURL=documentController.js.map