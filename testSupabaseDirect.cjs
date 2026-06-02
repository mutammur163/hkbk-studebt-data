// Quick Supabase diagnostic test
// Run with: node testSupabaseDirect.cjs

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://djgijlvdqenxqppupooz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ2lqbHZkcWVueHFwcHVwb296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjM3OTcsImV4cCI6MjA5NTg5OTc5N30.fAHWWyf40Xfx4caLY4XtgKvjdYNaDxQJoukhwkVsMmA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log('\n========================================');
  console.log('  SUPABASE DIAGNOSTIC TEST');
  console.log('========================================\n');

  // Test 1: Count all rows
  console.log('TEST 1: Counting rows in "students" table...');
  const { count, error: countError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('❌ ERROR reading table:', countError.message);
    console.log('   Code:', countError.code);
    console.log('   Hint:', countError.hint);
  } else {
    console.log(`✅ Total rows visible to frontend (anon key): ${count}`);
  }

  // Test 2: Fetch first 5 rows
  console.log('\nTEST 2: Fetching first 5 rows...');
  const { data, error: fetchError } = await supabase
    .from('students')
    .select('sl_no, usn, name, gender, category, quota, branch')
    .limit(5);

  if (fetchError) {
    console.log('❌ ERROR fetching rows:', fetchError.message);
  } else if (!data || data.length === 0) {
    console.log('⚠️  No rows returned! RLS is blocking access or table is empty.');
  } else {
    console.log(`✅ Sample rows (${data.length} returned):`);
    data.forEach((s, i) => {
      console.log(`   ${i + 1}. USN: ${s.usn} | Name: ${s.name} | Branch: ${s.branch} | Quota: ${s.quota}`);
    });
  }

  // Test 3: Check column names
  console.log('\nTEST 3: Checking column names in first row...');
  const { data: colData } = await supabase.from('students').select('*').limit(1);
  if (colData && colData.length > 0) {
    console.log('✅ Column names found:', Object.keys(colData[0]).join(', '));
  } else {
    console.log('⚠️  Cannot check columns - no data accessible');
  }

  console.log('\n========================================');
  console.log('  DIAGNOSIS COMPLETE');
  console.log('========================================\n');
}

diagnose().catch(console.error);
