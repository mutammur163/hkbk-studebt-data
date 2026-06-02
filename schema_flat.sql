-- ─── STUDENTS FLAT SCHEMA FOR CSV IMPORT ─────────────────────────────────────
-- This schema is optimized for direct CSV imports.
-- Table columns match the spreadsheet: sl_no, usn, name, gender, category, quota, branch.

-- 1. Drop existing table to ensure a clean state
DROP TABLE IF EXISTS students_flat CASCADE;

-- 2. Create the students table
CREATE TABLE students_flat (
    sl_no INT, -- Plain INT to safely accept existing serial numbers from the CSV
    usn VARCHAR(20) PRIMARY KEY, -- USN serves as a unique primary key
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(15) CHECK (gender IN ('Male', 'Female', 'Other')),
    category VARCHAR(20) NOT NULL, -- OBC, 2B, 3B, GM, SC, ST etc.
    quota VARCHAR(30) CHECK (quota IN ('MANAGEMENT', 'KCET', 'SNQ', 'KRLMPCA', 'Diploma')),
    branch VARCHAR(15) NOT NULL, -- AIML, CSE, ISE, ECE etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create indexes for performance optimization
CREATE INDEX idx_students_flat_quota ON students_flat(quota);
CREATE INDEX idx_students_flat_branch ON students_flat(branch);
CREATE INDEX idx_students_flat_category ON students_flat(category);
