import prisma from './client';

const branches = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'] as const;
const quotas = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'] as const;
const categories = ['GM', 'SNQ', 'SC', 'ST', 'OBC-A', 'OBC-B'] as const;
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Isha', 'Kavya', 'Riya', 'Priya', 'Neha',
  'Rahul', 'Amit', 'Suresh', 'Mohan', 'Deepak', 'Kiran', 'Pooja', 'Sneha', 'Meera', 'Tanvi',
  'Rohan', 'Nikhil', 'Akash', 'Vikram', 'Harsha',
];
const lastNames = [
  'Sharma', 'Patel', 'Reddy', 'Kumar', 'Gowda', 'Shetty', 'Naik', 'Rao', 'Hegde', 'Nair',
  'Joshi', 'Patil', 'Desai', 'Kulkarni', 'Iyer', 'Bhat', 'Acharya', 'Srinivas', 'Prasad', 'Murthy',
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeStudent(i: number) {
  const branch = rand(branches);
  const quota = rand(quotas);
  const category = rand(categories);
  const gender = Math.random() > 0.45 ? 'Male' : 'Female';
  const firstName = rand(firstNames);
  const lastName = rand(lastNames);
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
    sl_no: i,
    usn: `1HK24${deptCode[branch] || 'CS'}${String(i).padStart(3, '0')}`,
    name: `${firstName} ${lastName}`,
    gender,
    category,
    quota,
    branch,
  };
}

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE public.students ENABLE ROW LEVEL SECURITY');
  await prisma.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow select students" ON public.students');
  await prisma.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow insert students" ON public.students');
  await prisma.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow update students" ON public.students');
  await prisma.$executeRawUnsafe('CREATE POLICY "Allow select students" ON public.students FOR SELECT USING (true)');
  await prisma.$executeRawUnsafe('CREATE POLICY "Allow insert students" ON public.students FOR INSERT WITH CHECK (true)');
  await prisma.$executeRawUnsafe('CREATE POLICY "Allow update students" ON public.students FOR UPDATE USING (true) WITH CHECK (true)');

  const students = Array.from({ length: 40 }, (_, index) => makeStudent(index + 1));

  for (const student of students) {
    await prisma.student.upsert({
      where: { usn: student.usn },
      create: student,
      update: student,
    });
  }

  const count = await prisma.student.count();
  console.log(`✅ Seeded ${count} students into the students table and enabled student table policies.`);
}

main()
  .catch((error) => {
    console.error('Failed to seed students:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
