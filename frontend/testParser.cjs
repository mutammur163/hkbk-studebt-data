const fs = require('fs');

const rawCSV = `-admission_id,usn,name,department,admission_type,cet_no,rank,category,admission_order_no,college_confirmed_date,gender
A001,1HK25AI001,S PRADEEP,AIML,KCET,MZ531,106096,SCG,82690,2025-09-12 19:20:49,
A002,1HK25AI002,UDAY BASAPPA KATTIMANI,AIML,KCET,KU217,106121,SCG,8332,2025-08-07 12:21:05,
A003,1HK25AI003,GAJALAKSHMI RUDRESH GOVANKOPPA,AIML,KCET,BL957,130726,SCG,66652,2025-09-13 17:24:22,
A004,1HK25AI004,AKSHATHA BHIMAPPA HADAGALI,AIML,KCET,LP660,155907,STG,29252,2025-09-01 16:30:12,
A005,1HK25AI005,KRUTHIKA H HUDED,AIML,KCET,PF305,176108,STG,91874,2025-09-13 15:06:07,
A006,1HK25AI006,SHEETAL,AIML,KCET,EP928,26775,SNQ,34848,2025-09-02 16:59:32,
A007,1HK25AI007,YASHAVANTH K R,AIML,KCET,GS841,29688,SNQ,17263,2025-08-09 17:41:49,
A008,1HK25AI008,ZUNAIRA TASKEEN,AIML,KCET,JA219,34330,SNQ,1841,2025-08-05 21:09:31,
A009,1HK25AI009,ALFIYA NOORAIN,AIML,KCET,CF901,37269,GM,15321,2025-08-08 17:23:44,
A010,1HK25AI010,MOHAMMED FARHAAN,AIML,KCET,NN844,38229,SNQ,52121,2025-09-03 17:52:34,

A011,1HK25CS001,SAYED MOHAMMED ALI MAKANDAR,CSE,DIPLOMA,A7300,11906,GM,2526001097,,Male
A012,1HK25CS002,BHAVANA H J,CSE,DIPLOMA,B5963,13107,GM,2526000834,,Female
A013,1HK25CS003,RAGHAVENDRA N,CSE,DIPLOMA,B6689,14812,GMR,2526000446,,Male
A014,1HK25CS004,MAHAMMADJAFAR BADIGER,CSE,DIPLOMA,B7626,15575,GM,2526000754,,Male
A015,1HK25CS005,MAHADEVASWAMY N,CSE,DIPLOMA,A6866,5479,GM,2526000759,,Male
A016,1HK25CS006,SANIYA,CSE,DIPLOMA,B3908,6869,GM,2526000632,,Female
A017,1HK25CS007,SYED HASAAN,CSE,DIPLOMA,A6834,7079,GM,2526001108,,Male
A018,1HK25CS008,MOHAMMED MUDASSIR A MIRZA,CSE,DIPLOMA,A4673,7543,GM,2526000359,,Male
A019,1HK25CS009,HARSHITH P,CSE,DIPLOMA,B9359,7765,GM,2526000615,,Male
A020,1HK25CS010,ABRARAHMED DAWOOD TANJI,CSE,DIPLOMA,B1626,9751,GM,2526000459,,Male

A021,1HK25EC001,RASHID KHAN,ECE,DIPLOMA,A2137,14307,GM,2526001101,,Male
A022,1HK25EC002,TALWAR SHRIGANESH SIDDRAM,ECE,DIPLOMA,A0024,15157,GM,2526001088,,Male
A023,1HK25EC003,MUTTU HOTI,ECE,DIPLOMA,B1787,15617,GM,2526001059,,Male
A024,1HK25EC004,ARJUN,ECE,DIPLOMA,B4198,18610,GM,2526001099,,Male
A025,1HK25EC005,RACHAYYA G HIREMATH,ECE,DIPLOMA,B5642,6037,GM,2526000457,,Male
A026,1HK25EC006,MANOJ,ECE,DIPLOMA,B1968,6806,GM,2526001107,,Male
A027,1HK25EC007,T K KEERTHI,ECE,DIPLOMA,A4240,6825,GM,2526001082,,Female
A028,1HK25EC008,S GOKUL,ECE,DIPLOMA,A8440,7474,2AG,2526001037,,Male
A029,1HK25EC009,G MANJUNATH,ECE,DIPLOMA,B0875,8457,GM,2526001032,,Male
A030,1HK25EC010,SANA KASHIMASAB MASUTI,ECE,DIPLOMA,B2149,9340,1G,2526000462,,Female

A031,1HK25IS001,NITHIN KUMAR K P,ISE,DIPLOMA,A8699,13309,GM,2526000449,,Male
A032,1HK25IS002,K UBEDULLA,ISE,DIPLOMA,B1419,15841,GM,2526000300,,Male

A033,1HK25ME001,PAVANAKUMAR,ME,DIPLOMA,B5115,12299,2AG,2526000373,,Male

A034,1HK25AI050,PRIYA PATEL,AIML,MANAGEMENT,,,,,,Female
A035,1HK25CS060,IMRAN KHAN,CSE,KRLMPCA,,,,,,Male
A036,1HK25EC070,RAVI KUMAR,ECE,MANAGEMENT,,,,,,Male
A037,1HK25IS080,SNEHA REDDY,ISE,MANAGEMENT,,,,,,Female
A038,1HK25ME090,ARJUN KUMAR,ME,MANAGEMENT,,,,,,Male
A039,1HK25CS100,ABDUL MANNAN,CSE,KRLMPCA,,,,,,Male
A040,1HK25AI120,AFRA NAJI,AIML,MANAGEMENT,,,,,,Female`;

function cleanStudentData(data) {
  return data.map(row => {
    let branch = (row.branch || row.department || '').toString().toUpperCase().trim();
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
      quota: row.quota?.toString().toUpperCase().trim() || null,
      branch: branch || null,
    };
  });
}

function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
  
  const result = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      let value = values[index]?.replace(/"/g, '').trim();
      if (value === '') value = null;
      obj[header] = value;
      return obj;
    }, {});
  });
  
  return cleanStudentData(result);
}

async function testUpload() {
  const parsed = parseCSV(rawCSV);
  const validStudents = parsed.filter(s => s.usn);
  
  console.log("Total parsed:", parsed.length);
  console.log("Valid students (with USN):", validStudents.length);
  if (validStudents.length > 0) {
    console.log("First valid student:", validStudents[0]);
  } else {
    console.log("All parsed data:", parsed.slice(0, 3));
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient('https://fpugoioclodgqaspazfl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdWdvaW9jbG9kZ3Fhc3BhemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDkzODYsImV4cCI6MjA5MzA4NTM4Nn0.iKdxh5TBs0NMf9mZGZlhG8DpW1YPwT_mdy4mVZSaIG4');
  
  const { data, error } = await supabase.from('students').upsert(validStudents, { onConflict: 'usn' }).select();
  console.log("UPSERT ERROR:", error);
  console.log("UPSERT SUCCESS COUNT:", data ? data.length : 0);
}

testUpload();
