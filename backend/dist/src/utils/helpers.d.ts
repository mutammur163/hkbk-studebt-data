export declare function normalizeCategory(raw: string | null | undefined): string | null;
export declare function paginationParams(query: any): {
    skip: number;
    take: number;
    page: number;
};
export declare function buildPaginatedResponse(data: any[], total: number, page: number, limit: number): {
    success: boolean;
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};
//# sourceMappingURL=helpers.d.ts.map