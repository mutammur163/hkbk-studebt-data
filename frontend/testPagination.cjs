const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fpugoioclodgqaspazfl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdWdvaW9jbG9kZ3Fhc3BhemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDkzODYsImV4cCI6MjA5MzA4NTM4Nn0.iKdxh5TBs0NMf9mZGZlhG8DpW1YPwT_mdy4mVZSaIG4');

async function test() {
  let allData = [];
  let hasMore = true;
  let start = 0;
  const step = 1000;

  try {
    while (hasMore) {
      console.log(`Fetching ${start} to ${start + step - 1}`);
      let query = supabase.from('students').select('*').range(start, start + step - 1);
      const { data, error } = await query;
      
      if (error) {
        console.error("Query error:", error);
        break;
      }
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        start += step;
        if (data.length < step) hasMore = false;
      } else {
        hasMore = false;
      }
    }
    console.log("Total fetched:", allData.length);
  } catch (err) {
    console.error("Crashed:", err);
  }
}
test();
