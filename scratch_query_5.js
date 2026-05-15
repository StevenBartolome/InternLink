const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  console.log(data);
}

test();
