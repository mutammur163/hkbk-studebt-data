"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const branches = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'ISE', 'AIML', 'CV'];
const quotas = ['KCET', 'MANAGEMENT', 'KRLMPCA', 'DIPLOMA', 'SNQ'];
const categories = ['GM', 'SNQ', 'SC', 'ST', 'OBC-A', 'OBC-B'];
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
function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function makeStudent(i) {
    const branch = rand(branches);
    const quota = rand(quotas);
    const category = rand(categories);
    const gender = Math.random() > 0.45 ? 'Male' : 'Female';
    const firstName = rand(firstNames);
    const lastName = rand(lastNames);
    const deptCode = {
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
    await client_1.default.$executeRawUnsafe('ALTER TABLE public.students ENABLE ROW LEVEL SECURITY');
    await client_1.default.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow select students" ON public.students');
    await client_1.default.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow insert students" ON public.students');
    await client_1.default.$executeRawUnsafe('DROP POLICY IF EXISTS "Allow update students" ON public.students');
    await client_1.default.$executeRawUnsafe('CREATE POLICY "Allow select students" ON public.students FOR SELECT USING (true)');
    await client_1.default.$executeRawUnsafe('CREATE POLICY "Allow insert students" ON public.students FOR INSERT WITH CHECK (true)');
    await client_1.default.$executeRawUnsafe('CREATE POLICY "Allow update students" ON public.students FOR UPDATE USING (true) WITH CHECK (true)');
    const students = Array.from({ length: 40 }, (_, index) => makeStudent(index + 1));
    for (const student of students) {
        await client_1.default.student.upsert({
            where: { usn: student.usn },
            create: student,
            update: student,
        });
    }
    const count = await client_1.default.student.count();
    console.log(`✅ Seeded ${count} students into the students table and enabled student table policies.`);
}
main()
    .catch((error) => {
    console.error('Failed to seed students:', error);
    process.exit(1);
})
    .finally(async () => {
    await client_1.default.$disconnect();
});
//# sourceMappingURL=seed_students.js.map