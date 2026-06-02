import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment');
}

const pool = new Pool({ connectionString });

// Minimal helper to match prisma-like calls used by controllers.
const client = {
  $executeRawUnsafe: async (sql: string) => {
    return pool.query(sql);
  },
  $disconnect: async () => {
    return pool.end();
  },
  // student operations
  student: {
    findMany: async (opts: any) => {
      const { where = {}, skip = 0, take = 100, orderBy } = opts || {};
      // Very small but practical implementation supporting basic filters by department/gender and pagination
      const clauses: string[] = [];
      const values: any[] = [];
      if (where.department) { values.push(where.department); clauses.push(`department = $${values.length}`); }
      if (where.gender) { values.push(where.gender); clauses.push(`gender = $${values.length}`); }

      let sql = 'SELECT * FROM students';
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      if (orderBy && orderBy.createdAt === 'desc') sql += ' ORDER BY created_at DESC';
      sql += ` LIMIT ${take} OFFSET ${skip}`;

      const res = await pool.query(sql, values);
      return res.rows;
    },
    count: async (opts: any = {}) => {
      const where = opts?.where || {};
      const clauses: string[] = [];
      const values: any[] = [];
      if (where.department) { values.push(where.department); clauses.push(`department = $${values.length}`); }
      if (where.gender) { values.push(where.gender); clauses.push(`gender = $${values.length}`); }
      let sql = 'SELECT COUNT(*)::int as cnt FROM students';
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      const res = await pool.query(sql, values);
      return res.rows[0].cnt;
    },
    groupBy: async (opts: any) => {
      const field = opts.by[0];
      const sql = `SELECT ${field} as ${field}, COUNT(*)::int as _count FROM students GROUP BY ${field}`;
      const res = await pool.query(sql);
      return res.rows.map((r: any) => ({ [field]: r[field], _count: r._count }));
    },
    findUnique: async ({ where }: any) => {
      const res = await pool.query('SELECT * FROM students WHERE id = $1', [where.id]);
      return res.rows[0] || null;
    },
    create: async ({ data }: any) => {
      // naive insert — map fields used by seeders/controllers
      const cols = Object.keys(data).filter(k => k !== 'admission');
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (data as any)[c]);
      const sql = `INSERT INTO students (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
      const res = await pool.query(sql, values);
      const student = res.rows[0];
      // create admission if exists
      if (data.admission) {
        const ad = data.admission.create || data.admission;
        const adCols = Object.keys(ad);
        const adVals = adCols.map((_, i) => `$${i + 1}`);
        const adValues = adCols.map(c => (ad as any)[c]);
        // ensure student_id column
        adCols.push('student_id');
        adValues.push(student.id);
        const adSql = `INSERT INTO admissions (${adCols.join(',')}) VALUES (${adVals.join(',')})`;
        await pool.query(adSql, adValues);
      }
      return student;
    },
    update: async ({ where, data }: any) => {
      const sets: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const k of Object.keys(data)) {
        if (k === 'admission') continue;
        sets.push(`${k} = $${idx++}`);
        values.push((data as any)[k]);
      }
      values.push(where.id);
      const sql = `UPDATE students SET ${sets.join(',')} WHERE id = $${idx} RETURNING *`;
      const res = await pool.query(sql, values);
      // update admission if provided
      if (data.admission) {
        const ad = data.admission.update || data.admission;
        const adSets: string[] = [];
        const adVals: any[] = [];
        let j = 1;
        for (const k of Object.keys(ad)) { adSets.push(`${k} = $${j++}`); adVals.push((ad as any)[k]); }
        adVals.push(where.id);
        const adSql = `UPDATE admissions SET ${adSets.join(',')} WHERE student_id = $${j}`;
        await pool.query(adSql, adVals);
      }
      return res.rows[0];
    },
    delete: async ({ where }: any) => {
      await pool.query('DELETE FROM admissions WHERE student_id = $1', [where.id]);
      const res = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [where.id]);
      return res.rows[0];
    }
    ,
    upsert: async ({ where, update, create }: any) => {
      // upsert by usn
      const cols = Object.keys(create);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (create as any)[c]);
      const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
      const sql = `INSERT INTO students (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (usn) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    }
  },
  user: {
    findUnique: async ({ where }: any) => {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [where.email]);
      return res.rows[0] || null;
    },
    create: async ({ data }: any) => {
      const cols = Object.keys(data);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (data as any)[c]);
      const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    },
    upsert: async ({ where, update, create }: any) => {
      const cols = Object.keys(create);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (create as any)[c]);
      const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
      const conflict = Object.keys(where)[0];
      const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    }
  },
  category: {
    upsert: async ({ where, update, create }: any) => {
      const cols = Object.keys(create);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (create as any)[c]);
      const updates = Object.keys(update || create).map(c => `${c} = EXCLUDED.${c}`);
      const conflict = Object.keys(where)[0];
      const sql = `INSERT INTO categories (${cols.join(',')}) VALUES (${vals.join(',')}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    }
  },
  admission: {
    groupBy: async ({ by, where }: any) => {
      // Only support simple group by on allottedCategory or admissionType
      const groupField = by[0];
      const clauses: string[] = [];
      const values: any[] = [];
      if (where && where.student && where.student.department) { values.push(where.student.department); clauses.push(`student_id IN (SELECT id FROM students WHERE department = $${values.length})`); }
      let sql = `SELECT ${groupField} as ${groupField}, COUNT(*) as _count, MIN(rank) as _min_rank, MAX(rank) as _max_rank FROM admissions`;
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      sql += ` GROUP BY ${groupField}`;
      const res = await pool.query(sql, values);
      return res.rows.map((r: any) => ({ [groupField]: r[groupField], _count: parseInt(r._count, 10), _min: { rank: r._min_rank }, _max: { rank: r._max_rank } }));
    },
    aggregate: async ({ where, _min, _max, _avg }: any) => {
      const clauses: string[] = [];
      const values: any[] = [];
      if (where && where.student && where.student.department) { values.push(where.student.department); clauses.push(`student_id IN (SELECT id FROM students WHERE department = $${values.length})`); }
      let sql = `SELECT MIN(rank) as min_rank, MAX(rank) as max_rank, AVG(rank) as avg_rank FROM admissions`;
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      const res = await pool.query(sql, values);
      return { _min: { rank: res.rows[0].min_rank }, _max: { rank: res.rows[0].max_rank }, _avg: { rank: res.rows[0].avg_rank } };
    }
  },
  auditLog: {
    create: async ({ data }: any) => {
      const cols = Object.keys(data);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (data as any)[c]);
      const sql = `INSERT INTO audit_logs (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    },
    createMany: async ({ data }: any) => {
      for (const d of data) {
        const cols = Object.keys(d);
        const vals = cols.map((_, i) => `$${i + 1}`);
        const values = cols.map(c => (d as any)[c]);
        const sql = `INSERT INTO audit_logs (${cols.join(',')}) VALUES (${vals.join(',')})`;
        await pool.query(sql, values);
      }
    }
  },
  document: {
    create: async ({ data }: any) => {
      const cols = Object.keys(data);
      const vals = cols.map((_, i) => `$${i + 1}`);
      const values = cols.map(c => (data as any)[c]);
      const sql = `INSERT INTO documents (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    },
    findMany: async ({ where, skip = 0, take = 100, orderBy }: any) => {
      const clauses: string[] = [];
      const values: any[] = [];
      if (where?.type) { values.push(where.type); clauses.push(`type = $${values.length}`); }
      if (where?.academicYear) { values.push(where.academicYear); clauses.push(`academic_year = $${values.length}`); }
      if (where?.department) { values.push(where.department); clauses.push(`department = $${values.length}`); }
      let sql = 'SELECT d.*, u.name as uploader_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by';
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      if (orderBy && orderBy.createdAt === 'desc') sql += ' ORDER BY d.created_at DESC';
      sql += ` LIMIT ${take} OFFSET ${skip}`;
      const res = await pool.query(sql, values);
      return res.rows;
    },
    count: async ({ where }: any) => {
      const clauses: string[] = [];
      const values: any[] = [];
      if (where?.type) { values.push(where.type); clauses.push(`type = $${values.length}`); }
      if (where?.academicYear) { values.push(where.academicYear); clauses.push(`academic_year = $${values.length}`); }
      if (where?.department) { values.push(where.department); clauses.push(`department = $${values.length}`); }
      let sql = 'SELECT COUNT(*)::int as cnt FROM documents';
      if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
      const res = await pool.query(sql, values);
      return res.rows[0].cnt;
    },
    findUnique: async ({ where }: any) => {
      const res = await pool.query('SELECT * FROM documents WHERE id = $1', [where.id]);
      return res.rows[0] || null;
    }
  }
};

export default client;
