import { Student, CutoffEntry, DocumentItem, UserAccount, InsightItem, Branch, Quota } from '../types';

const branches: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'];
const quotas: Quota[] = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'];
const cats = ['GM', 'SNQ', 'SC', 'ST', 'OBC-A', 'OBC-B'] as const;
const fnames = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Vihaan',
  'Arjun',
  'Sai',
  'Reyansh',
  'Ayaan',
  'Krishna',
  'Ishaan',
  'Ananya',
  'Diya',
  'Myra',
  'Sara',
  'Aadhya',
  'Isha',
  'Kavya',
  'Riya',
  'Priya',
  'Neha',
  'Rahul',
  'Amit',
  'Suresh',
  'Mohan',
  'Deepak',
  'Kiran',
  'Pooja',
  'Sneha',
  'Meera',
  'Tanvi',
  'Rohan',
  'Nikhil',
  'Akash',
  'Vikram',
  'Harsha',
];
const lnames = [
  'Sharma',
  'Patel',
  'Reddy',
  'Kumar',
  'Gowda',
  'Shetty',
  'Naik',
  'Rao',
  'Hegde',
  'Nair',
  'Joshi',
  'Patil',
  'Desai',
  'Kulkarni',
  'Iyer',
  'Bhat',
  'Acharya',
  'Srinivas',
  'Prasad',
  'Murthy',
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function makeStudent(i: number): Student {
  const branch = rand(branches);
  const quota = rand(quotas);
  const category = rand(cats);
  const g = Math.random() > 0.45 ? 'Male' : 'Female';
  const fn = rand(fnames);
  const ln = rand(lnames);
  const yr = 2024;
  const deptCode: Record<string, string> = {
    CSE: 'CS',
    ECE: 'EC',
    ME: 'ME',
    CE: 'CV',
    EEE: 'EE',
    ISE: 'IS',
    AIML: 'AD',
    CV: 'CV',
  };
  return {
    id: `STU${String(i).padStart(4, '0')}`,
    sl_no: i,
    name: `${fn} ${ln}`,
    usn: `1HK${yr % 100}${deptCode[branch] || 'CS'}${String(i).padStart(3, '0')}`,
    gender: g,
    category,
    quota,
    branch,
  };
}

export const students: Student[] = Array.from({ length: 40 }, (_, i) => makeStudent(i + 1));

export const cutoffData: CutoffEntry[] = [];
branches.forEach((b) => {
  (['GM', 'SC', 'ST', 'OBC-A', 'OBC-B'] as const).forEach((c) => {
    cutoffData.push({ branch: b, category: c, year: 2024, note: 'Legacy document index' });
  });
});

export const documents: DocumentItem[] = [
  {
    id: 'D1',
    title: 'KCET Round 1 Seat Allotment 2024',
    type: 'Seat Allotment',
    year: 2024,
    fileUrl: '/documents/KCET Round 1 Seat Allotment 2024.pdf',
    uploadedAt: '2024-07-15',
    size: '302 KB',
  },
  {
    id: 'D2',
    title: 'KCET Round 2 Seat Allotment 2024',
    type: 'Seat Allotment',
    year: 2024,
    fileUrl: '/documents/KCET Round 2 Seat Allotment 2024.pdf',
    uploadedAt: '2024-08-01',
    size: '290 KB',
  },
  {
    id: 'D3',
    title: 'Fee Structure 2024-25',
    type: 'Fee Structure',
    year: 2024,
    fileUrl: '/documents/Fee Structure 2024-25.pdf',
    uploadedAt: '2024-06-01',
    size: '90 KB',
  },
  {
    id: 'D4',
    title: 'Fee Structure 2023-24',
    type: 'Fee Structure',
    year: 2023,
    fileUrl: '/documents/Fee Structure 2023-24.pdf',
    uploadedAt: '2023-06-01',
    size: '46 KB',
  },
  {
    id: 'D5',
    title: 'KCET Cutoff Ranks 2024',
    type: 'Cutoff',
    year: 2024,
    fileUrl: '/documents/KCET Cutoff Ranks 2024.pdf',
    uploadedAt: '2024-09-01',
    size: '302 KB',
  },
  {
    id: 'D6',
    title: 'KCET Cutoff Ranks 2023',
    type: 'Cutoff',
    year: 2023,
    fileUrl: '/documents/KCET Cutoff Ranks 2023.pdf',
    uploadedAt: '2023-09-01',
    size: '340 KB',
  },
  {
    id: 'D7',
    title: 'Management Quota Allotment 2024',
    type: 'Seat Allotment',
    year: 2024,
    fileUrl: '/documents/Management Quota Allotment 2024.pdf',
    uploadedAt: '2024-08-20',
    size: '25.5 MB',
  },
  {
    id: 'D8',
    title: 'KRLMPCA Cutoff Ranks 2024',
    type: 'Cutoff',
    year: 2024,
    fileUrl: '/documents/KRLMPCA Cutoff Ranks 2024.pdf',
    uploadedAt: '2024-09-15',
    size: '876 KB',
  },
];

export const users: UserAccount[] = [
  { id: 'U1', name: 'HKBKCE-Principal Office', email: 'rajesh.k@hkbkce.edu.in', role: 'Admin', avatar: 'HP', lastLogin: '2024-11-15 09:30', status: 'Active' },
  { id: 'U2', name: 'Priya Sharma', email: 'priya.s@hkbkce.edu.in', role: 'Admission Staff', avatar: 'PS', lastLogin: '2024-11-15 08:45', status: 'Active' },
  { id: 'U3', name: 'Mohan Rao', email: 'mohan.r@hkbkce.edu.in', role: 'Faculty', avatar: 'MR', lastLogin: '2024-11-14 16:20', status: 'Active' },
  { id: 'U4', name: 'Sneha Patil', email: 'sneha.p@hkbkce.edu.in', role: 'Viewer', avatar: 'SP', lastLogin: '2024-11-10 11:00', status: 'Active' },
  { id: 'U5', name: 'Amit Desai', email: 'amit.d@hkbkce.edu.in', role: 'Admission Staff', avatar: 'AD', lastLogin: '2024-11-13 14:15', status: 'Inactive' },
];

const cseCount = students.filter((s) => s.branch === 'CSE').length;
const snqCat = students.filter((s) => s.category === 'SNQ').length;
const totalMgmt = students.filter((s) => s.quota === 'MANAGEMENT').length;
const maleN = students.filter((s) => s.gender === 'Male').length;
const femaleN = students.filter((s) => s.gender === 'Female').length;

export const insights: InsightItem[] = [
  { id: 'I1', message: `CSE has the highest sample intake with ${cseCount} students`, type: 'info', icon: 'trending-up' },
  {
    id: 'I2',
    message: `Gender mix: ${maleN} male / ${femaleN} female in the sample dataset`,
    type: 'success',
    icon: 'users',
  },
  { id: 'I3', message: `SNQ category: ${snqCat} students (${((snqCat / students.length) * 100).toFixed(1)}%)`, type: 'info', icon: 'users' },
  { id: 'I4', message: `Management quota (sample): ${totalMgmt} students`, type: 'warning', icon: 'alert-circle' },
  { id: 'I5', message: `KCET share: ${((students.filter((s) => s.quota === 'KCET').length / students.length) * 100).toFixed(1)}% of sample students`, type: 'success', icon: 'check-circle' },
];

export const branchDistribution = branches.map((d) => ({
  name: d,
  students: students.filter((s) => s.branch === d).length,
  fill:
    d === 'CSE'
      ? '#7C3AED'
      : d === 'ECE'
        ? '#3B82F6'
        : d === 'ISE'
          ? '#10B981'
          : d === 'AIML'
            ? '#F59E0B'
            : d === 'ME'
              ? '#EF4444'
              : d === 'CE'
                ? '#8B5CF6'
                : d === 'EEE'
                  ? '#06B6D4'
                  : d === 'CV'
                    ? '#EC4899'
                    : '#6366F1',
}));

export const categoryDistribution = cats.map((c) => ({
  name: c,
  value: students.filter((s) => s.category === c).length,
  fill: c === 'GM' ? '#7C3AED' : c === 'SNQ' ? '#10B981' : c === 'SC' || c === 'ST' ? '#F59E0B' : '#3B82F6',
}));
