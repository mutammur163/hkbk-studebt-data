const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fpugoioclodgqaspazfl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdWdvaW9jbG9kZ3Fhc3BhemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDkzODYsImV4cCI6MjA5MzA4NTM4Nn0.iKdxh5TBs0NMf9mZGZlhG8DpW1YPwT_mdy4mVZSaIG4');

async function test() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}

test();
