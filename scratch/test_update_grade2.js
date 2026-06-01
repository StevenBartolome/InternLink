import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const selectedStudentId = 'ac8306a4-ab1c-411d-bcd5-698f7b71d9cd';
  const gradeNum = 95;
  const { data, error } = await supabase
    .from('student_internships')
    .update({ 
      final_grade: gradeNum,
      final_grade_encoded_at: new Date().toISOString(),
      is_completed: true,
      current_stage: 'COMPLETED'
    })
    .eq('student_id', selectedStudentId)
    .select();
  
  console.log('Update result:', data);
  console.log('Error:', error);
}

test();
