const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, first_name, last_name, is_active, created_at,
      programs ( code )
    `)
    .in('role', ['ojt_head', 'professor']);
    
  console.log(JSON.stringify(error, null, 2));
}

test();
