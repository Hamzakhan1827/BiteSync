const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/[\"']/g, '');
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/[\"']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  const { data } = await supabase.from('users').select('email, managed_restaurant_id, is_super_admin');
  console.log(JSON.stringify(data, null, 2));
}
check();
