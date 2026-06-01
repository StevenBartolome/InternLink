import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('student_internships').select('student_id').limit(1);
  console.log('Using SERVICE_ROLE_KEY to check table access:', data);
}
test();
