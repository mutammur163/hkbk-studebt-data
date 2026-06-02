import type { Student } from '../types';

export const exportToCSV = (data: any[], filename = 'students_export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => `"${val || ''}"`).join(',')
  ).join('\n');

  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const STUDENT_EXPORT_COLS = ['sl_no', 'usn', 'name', 'gender', 'category', 'quota', 'branch'] as const;

/** CSV export using only canonical student columns (matches Supabase schema). */
export function exportStudentsToCSV(data: Student[], filename = 'students_export.csv') {
  if (!data?.length) return;
  const headers = STUDENT_EXPORT_COLS.join(',');
  const rows = data
    .map((row) =>
      STUDENT_EXPORT_COLS.map((c) => {
        const v = row[c as keyof Student];
        const s = v === null || v === undefined ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      }).join(',')
    )
    .join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Normalizes quota/admission-type values from the CSV (Supabase) to the
 * canonical names used in the project.
 *
 * CSV alias  →  Project name
 * ----------    ----------------
 * MGT            MANAGEMENT
 * MGMT           MANAGEMENT
 * MANAGEMENT     MANAGEMENT   (passthrough)
 * CET            KCET
 * KCET           KCET         (passthrough)
 * KRLMPCA        KRLMPCA      (passthrough)
 * DIPLOMA        DIPLOMA      (passthrough)
 * SNQ            SNQ          (passthrough)
 */
export function normalizeQuota(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const upper = raw.toString().toUpperCase().trim();
  const quotaMap: Record<string, string> = {
    'MGT':        'MANAGEMENT',
    'MGMT':       'MANAGEMENT',
    'MANAGEMENT': 'MANAGEMENT',
    'CET':        'KCET',
    'KCET':       'KCET',
    'KRLMPCA':    'KRLMPCA',
    'DIPLOMA':    'DIPLOMA',
    'SNQ':        'SNQ',
  };
  return quotaMap[upper] ?? upper;
}

export function cleanStudentData(data: any[]): any[] {
  return data.map(row => {
    let branch = (row.branch || '').toString().toUpperCase().trim();
    branch = branch.replace(/[^A-Z]/g, '');
    if (branch === 'CS') branch = 'CSE';
    if (branch === 'IS') branch = 'ISE';
    if (branch === 'EC') branch = 'ECE';

    return {
      sl_no: row.sl_no?.toString().trim() || null,
      usn: row.usn?.toString().trim() || null,
      name: row.name?.toString().trim() || '',
      gender: row.gender?.toString().trim() || null,
      category: row.category?.toString().trim() || null,
      // Normalize CSV alias (MGT, CET, …) → canonical project quota name
      quota: normalizeQuota(row.quota),
      branch: branch || null,
    };
  });
}

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
      
      const result = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          let value: any = values[index]?.replace(/"/g, '').trim();
          if (value === '') value = null;
          obj[header] = value;
          return obj;
        }, {});
      });
      
      resolve(cleanStudentData(result));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
