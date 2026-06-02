"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCategory = normalizeCategory;
exports.paginationParams = paginationParams;
exports.buildPaginatedResponse = buildPaginatedResponse;
// Category normalization map
const categoryMap = {
    'GMH': 'GM', 'GMR': 'GM', 'GM': 'GM',
    'SCG': 'SCG', 'SCR': 'SCG', 'SC': 'SCG',
    'STG': 'STG', 'STR': 'STG', 'ST': 'STG',
    'OBC': 'OBC',
    'SNQ': 'SNQ',
    '1G': '1G', '1R': '1G',
    '2AG': '2AG', '2AR': '2AG',
    '2BG': '2BG', '2BR': '2BG',
    '3AG': '3AG', '3AR': '3AG',
    '3BG': '3BG', '3BR': '3BG',
};
function normalizeCategory(raw) {
    if (!raw)
        return null;
    const upper = raw.trim().toUpperCase();
    return categoryMap[upper] || upper;
}
function paginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    return { skip: (page - 1) * limit, take: limit, page };
}
function buildPaginatedResponse(data, total, page, limit) {
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
}
//# sourceMappingURL=helpers.js.map