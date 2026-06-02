const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  console.log('Fetching...');
  const { data, error } = await supabase
    .from('student_internships')
    .select(`
      id,
      student_id,
      current_stage,
      student:users!student_id (
        first_name,
        last_name,
        profile:student_profiles!id (
          student_id, 
          program_id,
          programs(id, name, code)
        )
      )
    `)
    .limit(1);
    
  if (error) console.error('Error:', error);
  else console.log('Data:', JSON.stringify(data, null, 2));
}
test();
