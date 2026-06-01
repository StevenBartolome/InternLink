import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Testing list files in bucket...');
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('backups')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    console.log('Result:', data, error);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
