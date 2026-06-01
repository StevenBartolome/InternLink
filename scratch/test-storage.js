import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Testing listBuckets...');
  try {
    const res = await supabaseAdmin.storage.listBuckets();
    console.log('Result:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
run();
