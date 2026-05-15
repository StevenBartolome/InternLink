const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, first_name, last_name, is_active,
      student_profiles (
        student_id, year_level, program_id,
        programs ( id, code, name )
      ),
      student_internships!student_internships_student_id_fkey (
        current_stage, ojt_head_id,
        users!student_internships_ojt_head_id_fkey ( first_name, last_name )
      )
    `)
    .eq('role', 'student');
    
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

test();
