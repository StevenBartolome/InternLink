import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey);

async function checkUserAndInternship() {
  const { data: users, error: userErr } = await supabaseAdmin
    .from('users')
    .select('*');

  if (userErr) {
    console.error('Error fetching users:', userErr);
  } else {
    console.log('--- USERS ---');
    console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name })), null, 2));
  }

  const { data: internships, error: internErr } = await supabaseAdmin
    .from('student_internships')
    .select('*');

  if (internErr) {
    console.error('Error fetching internships:', internErr);
  } else {
    console.log('--- STUDENT INTERNSHIPS ---');
    console.log(JSON.stringify(internships.map(i => ({ id: i.id, student_id: i.student_id, current_stage: i.current_stage })), null, 2));
  }
}

checkUserAndInternship();
