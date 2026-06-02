// Category normalization map
const categoryMap: Record<string, string> = {
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

export function normalizeCategory(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  return categoryMap[upper] || upper;
}

export function paginationParams(query: any): { skip: number; take: number; page: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { skip: (page - 1) * limit, take: limit, page };
}

export function buildPaginatedResponse(data: any[], total: number, page: number, limit: number) {
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
