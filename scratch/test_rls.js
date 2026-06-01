import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    console.log('Cant get policies via RPC, fetching from pg_policies');
    const { data: policies, error: polErr } = await supabase.from('pg_policies').select('*').eq('tablename', 'student_internships');
    console.log(policies, polErr);
  } else {
    console.log(data);
  }
}
test();
