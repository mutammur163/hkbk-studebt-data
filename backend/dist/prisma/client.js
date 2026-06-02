"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
}
const pool = new pg_1.Pool({ connectionString });
// Minimal helper to match prisma-like calls used by controllers.
const client = {
    $executeRawUnsafe: async (sql) => {
        return pool.query(sql);
    },
    $disconnect: async () => {
        return pool.end();
    },
    // student operations
    student: {
        findMany: async (opts) => {
            const { where = {}, skip = 0, take = 100, orderBy } = opts || {};
            // Very small but practical implementation supporting basic filters by department/gender and pagination
            const clauses = [];
            const values = [];
            if (where.department) {
                values.push(where.department);
                clauses.push(`department = $${values.length}`);
            }
            if (where.gender) {
                values.push(where.gender);
                clauses.push(`gender = $${values.length}`);
            }
            let sql = 'SELECT * FROM students';
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            if (orderBy && orderBy.createdAt === 'desc')
                sql += ' ORDER BY created_at DESC';
            sql += ` LIMIT ${take} OFFSET ${skip}`;
            const res = await pool.query(sql, values);
            return res.rows;
        },
        count: async (opts = {}) => {
            const where = opts?.where || {};
            const clauses = [];
            const values = [];
            if (where.department) {
                values.push(where.department);
                clauses.push(`department = $${values.length}`);
            }
            if (where.gender) {
                values.push(where.gender);
                clauses.push(`gender = $${values.length}`);
            }
            let sql = 'SELECT COUNT(*)::int as cnt FROM students';
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            const res = await pool.query(sql, values);
            return res.rows[0].cnt;
        },
        groupBy: async (opts) => {
            const field = opts.by[0];
            const sql = `SELECT ${field} as ${field}, COUNT(*)::int as _count FROM students GROUP BY ${field}`;
            const res = await pool.query(sql);
            return res.rows.map((r) => ({ [field]: r[field], _count: r._count }));
        },
        findUnique: async ({ where }) => {
            const res = await pool.query('SELECT * FROM students WHERE id = $1', [where.id]);
            return res.rows[0] || null;
        },
        create: async ({ data }) => {
            // naive insert — map fields used by seeders/controllers
            const cols = Object.keys(data).filter(k => k !== 'admission');
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => data[c]);
            const sql = `INSERT INTO students (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
            const res = await pool.query(sql, values);
            const student = res.rows[0];
            // create admission if exists
            if (data.admission) {
                const ad = data.admission.create || data.admission;
                const adCols = Object.keys(ad);
                const adVals = adCols.map((_, i) => `$${i + 1}`);
                const adValues = adCols.map(c => ad[c]);
                // ensure student_id column
                adCols.push('student_id');
                adValues.push(student.id);
                const adSql = `INSERT INTO admissions (${adCols.join(',')}) VALUES (${adVals.join(',')})`;
                await pool.query(adSql, adValues);
            }
            return student;
        },
        update: async ({ where, data }) => {
            const sets = [];
            const values = [];
            let idx = 1;
            for (const k of Object.keys(data)) {
                if (k === 'admission')
                    continue;
                sets.push(`${k} = $${idx++}`);
                values.push(data[k]);
            }
            values.push(where.id);
            const sql = `UPDATE students SET ${sets.join(',')} WHERE id = $${idx} RETURNING *`;
            const res = await pool.query(sql, values);
            // update admission if provided
            if (data.admission) {
                const ad = data.admission.update || data.admission;
                const adSets = [];
                const adVals = [];
                let j = 1;
                for (const k of Object.keys(ad)) {
                    adSets.push(`${k} = $${j++}`);
                    adVals.push(ad[k]);
                }
                adVals.push(where.id);
                const adSql = `UPDATE admissions SET ${adSets.join(',')} WHERE student_id = $${j}`;
                await pool.query(adSql, adVals);
            }
            return res.rows[0];
        },
        delete: async ({ where }) => {
            await pool.query('DELETE FROM admissions WHERE student_id = $1', [where.id]);
            const res = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [where.id]);
            return res.rows[0];
        },
        upsert: async ({ where, update, create }) => {
            // upsert by usn
            const cols = Object.keys(create);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => create[c]);
            const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
            const sql = `INSERT INTO students (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (usn) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        }
    },
    user: {
        findUnique: async ({ where }) => {
            const res = await pool.query('SELECT * FROM users WHERE email = $1', [where.email]);
            return res.rows[0] || null;
        },
        create: async ({ data }) => {
            const cols = Object.keys(data);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => data[c]);
            const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        },
        upsert: async ({ where, update, create }) => {
            const cols = Object.keys(create);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => create[c]);
            const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
            const conflict = Object.keys(where)[0];
            const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        }
    },
    category: {
        upsert: async ({ where, update, create }) => {
            const cols = Object.keys(create);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => create[c]);
            const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
            const conflict = Object.keys(where)[0];
            const sql = `INSERT INTO categories (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        }
    },
    admission: {
        groupBy: async ({ by, where }) => {
            // Only support simple group by on allottedCategory or admissionType
            const groupField = by[0];
            const clauses = [];
            const values = [];
            if (where && where.student && where.student.department) {
                values.push(where.student.department);
                clauses.push(`student_id IN (SELECT id FROM students WHERE department = $${values.length})`);
            }
            let sql = `SELECT ${groupField} as ${groupField}, COUNT(*) as _count, MIN(rank) as _min_rank, MAX(rank) as _max_rank FROM admissions`;
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            sql += ` GROUP BY ${groupField}`;
            const res = await pool.query(sql, values);
            return res.rows.map((r) => ({ [groupField]: r[groupField], _count: parseInt(r._count, 10), _min: { rank: r._min_rank }, _max: { rank: r._max_rank } }));
        },
        aggregate: async ({ where, _min, _max, _avg }) => {
            const clauses = [];
            const values = [];
            if (where && where.student && where.student.department) {
                values.push(where.student.department);
                clauses.push(`student_id IN (SELECT id FROM students WHERE department = $${values.length})`);
            }
            let sql = `SELECT MIN(rank) as min_rank, MAX(rank) as max_rank, AVG(rank) as avg_rank FROM admissions`;
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            const res = await pool.query(sql, values);
            return { _min: { rank: res.rows[0].min_rank }, _max: { rank: res.rows[0].max_rank }, _avg: { rank: res.rows[0].avg_rank } };
        }
    },
    auditLog: {
        create: async ({ data }) => {
            const cols = Object.keys(data);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => data[c]);
            const sql = `INSERT INTO audit_logs (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        },
        createMany: async ({ data }) => {
            for (const d of data) {
                const cols = Object.keys(d);
                const vals = cols.map((_, i) => `$${i + 1}`);
                const values = cols.map(c => d[c]);
                const sql = `INSERT INTO audit_logs (${cols.join(',')}) VALUES (${vals.join(',')})`;
                await pool.query(sql, values);
            }
        }
    },
    document: {
        create: async ({ data }) => {
            const cols = Object.keys(data);
            const vals = cols.map((_, i) => `$${i + 1}`);
            const values = cols.map(c => data[c]);
            const sql = `INSERT INTO documents (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
            const res = await pool.query(sql, values);
            return res.rows[0];
        },
        findMany: async ({ where, skip = 0, take = 100, orderBy }) => {
            const clauses = [];
            const values = [];
            if (where?.type) {
                values.push(where.type);
                clauses.push(`type = $${values.length}`);
            }
            if (where?.academicYear) {
                values.push(where.academicYear);
                clauses.push(`academic_year = $${values.length}`);
            }
            if (where?.department) {
                values.push(where.department);
                clauses.push(`department = $${values.length}`);
            }
            let sql = 'SELECT d.*, u.name as uploader_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by';
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            if (orderBy && orderBy.createdAt === 'desc')
                sql += ' ORDER BY d.created_at DESC';
            sql += ` LIMIT ${take} OFFSET ${skip}`;
            const res = await pool.query(sql, values);
            return res.rows;
        },
        count: async ({ where }) => {
            const clauses = [];
            const values = [];
            if (where?.type) {
                values.push(where.type);
                clauses.push(`type = $${values.length}`);
            }
            if (where?.academicYear) {
                values.push(where.academicYear);
                clauses.push(`academic_year = $${values.length}`);
            }
            if (where?.department) {
                values.push(where.department);
                clauses.push(`department = $${values.length}`);
            }
            let sql = 'SELECT COUNT(*)::int as cnt FROM documents';
            if (clauses.length)
                sql += ' WHERE ' + clauses.join(' AND ');
            const res = await pool.query(sql, values);
            return res.rows[0].cnt;
        },
        findUnique: async ({ where }) => {
            const res = await pool.query('SELECT * FROM documents WHERE id = $1', [where.id]);
            return res.rows[0] || null;
        }
    }
};
exports.default = client;
//# sourceMappingURL=client.js.map