declare const client: {
    $executeRawUnsafe: (sql: string) => Promise<import("pg").QueryResult<any>>;
    $disconnect: () => Promise<void>;
    student: {
        findMany: (opts: any) => Promise<any[]>;
        count: (opts?: any) => Promise<any>;
        groupBy: (opts: any) => Promise<{
            [x: number]: any;
            _count: any;
        }[]>;
        findUnique: ({ where }: any) => Promise<any>;
        create: ({ data }: any) => Promise<any>;
        update: ({ where, data }: any) => Promise<any>;
        delete: ({ where }: any) => Promise<any>;
        upsert: ({ where, update, create }: any) => Promise<any>;
    };
    user: {
        findUnique: ({ where }: any) => Promise<any>;
        create: ({ data }: any) => Promise<any>;
        upsert: ({ where, update, create }: any) => Promise<any>;
    };
    category: {
        upsert: ({ where, update, create }: any) => Promise<any>;
    };
    admission: {
        groupBy: ({ by, where }: any) => Promise<{
            [x: number]: any;
            _count: number;
            _min: {
                rank: any;
            };
            _max: {
                rank: any;
            };
        }[]>;
        aggregate: ({ where, _min, _max, _avg }: any) => Promise<{
            _min: {
                rank: any;
            };
            _max: {
                rank: any;
            };
            _avg: {
                rank: any;
            };
        }>;
    };
    auditLog: {
        create: ({ data }: any) => Promise<any>;
        createMany: ({ data }: any) => Promise<void>;
    };
    document: {
        create: ({ data }: any) => Promise<any>;
        findMany: ({ where, skip, take, orderBy }: any) => Promise<any[]>;
        count: ({ where }: any) => Promise<any>;
        findUnique: ({ where }: any) => Promise<any>;
    };
};
export default client;
//# sourceMappingURL=client.d.ts.map