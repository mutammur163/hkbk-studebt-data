import prisma from './client';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Categories
  const categories = [
    { code: 'GM', description: 'General Merit' },
    { code: 'GMR', description: 'General Merit Rural' },
    { code: 'GMH', description: 'General Merit Hyderabad-Karnataka' },
    { code: 'SCG', description: 'Scheduled Caste General' },
    { code: 'SCR', description: 'Scheduled Caste Rural' },
    { code: 'STG', description: 'Scheduled Tribe General' },
    { code: 'STR', description: 'Scheduled Tribe Rural' },
    { code: 'OBC', description: 'Other Backward Classes' },
    { code: 'SNQ', description: 'Supernumerary Quota' },
    { code: '1G', description: 'Category 1 General' },
    { code: '2AG', description: 'Category 2A General' },
    { code: '2BG', description: 'Category 2B General' },
    { code: '3AG', description: 'Category 3A General' },
    { code: '3BG', description: 'Category 3B General' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }
  console.log(`  ✅ ${categories.length} categories seeded`);

  // Seed Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@hkbkce.edu.in' },
    update: {
      name: 'HKBKCE-Principal Office',
    },
    create: {
      name: 'HKBKCE-Principal Office',
      email: 'admin@hkbkce.edu.in',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  // Seed Admission Staff
  const staffPassword = await bcrypt.hash('staff123', 12);
  await prisma.user.upsert({
    where: { email: 'priya.s@hkbkce.edu.in' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'priya.s@hkbkce.edu.in',
      passwordHash: staffPassword,
      role: 'admission_staff',
    },
  });

  // Seed Faculty
  const facultyPassword = await bcrypt.hash('faculty123', 12);
  await prisma.user.upsert({
    where: { email: 'mohan.r@hkbkce.edu.in' },
    update: {},
    create: {
      name: 'Mohan Rao',
      email: 'mohan.r@hkbkce.edu.in',
      passwordHash: facultyPassword,
      role: 'faculty',
    },
  });

  console.log('  ✅ Users seeded (admin/staff/faculty)');

  // Seed Sample Students
  const departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AI&ML', 'CV'];
  const admTypes: Array<'KCET' | 'Management' | 'KRLMPCA' | 'Diploma'> = ['KCET', 'Management', 'KRLMPCA', 'Diploma'];
  const catCodes = ['GM', 'SCG', 'STG', 'OBC', 'SNQ', '1G', '2AG', '2BG', '3AG'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Ananya', 'Diya', 'Myra', 'Kavya', 'Riya', 'Rahul', 'Amit', 'Deepak', 'Kiran', 'Pooja', 'Sneha', 'Rohan', 'Nikhil', 'Akash', 'Vikram'];
  const lastNames = ['Sharma', 'Patel', 'Reddy', 'Kumar', 'Gowda', 'Shetty', 'Naik', 'Rao', 'Hegde', 'Patil'];

  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

  const deptCode: Record<string, string> = { CSE: 'CS', ECE: 'EC', ME: 'ME', CE: 'CV', EEE: 'EE', ISE: 'IS', 'AI&ML': 'AD', CV: 'CV' };

  for (let i = 1; i <= 40; i++) {
    const dept = rand(departments);
    const admType = rand(admTypes);
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const gender = Math.random() > 0.45 ? 'Male' : 'Female';
    const usn = `1HK24${deptCode[dept] || 'CS'}${String(i).padStart(3, '0')}`;

    try {
      await prisma.student.create({
        data: {
          usn,
          name: `${fn} ${ln}`,
          gender,
          department: dept,
          year: 1,
          section: rand(['A', 'B', 'C']),
          mobile: `9${String(randInt(100000000, 999999999))}`,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
          admission: {
            create: {
              admissionType: admType,
              cetNo: `CET2024${String(randInt(10000, 99999))}`,
              rank: admType === 'KCET' ? randInt(500, 80000) : randInt(1000, 100000),
              claimedCategory: rand(catCodes),
              allottedCategory: rand(catCodes),
              seatType: rand(['Government', 'Management', 'COMEDK']),
              admissionRound: rand(['Round 1', 'Round 2', 'Round 3', 'Spot']),
              confirmationDate: new Date(`2024-${String(randInt(7, 9)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`),
            },
          },
        },
      });
    } catch {
      // Skip duplicates
    }
  }
  console.log('  ✅ 40 sample students seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
